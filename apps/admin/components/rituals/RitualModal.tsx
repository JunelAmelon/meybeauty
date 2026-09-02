'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/apps/admin/components/ui/dialog';
import { Button } from '@/apps/admin/components/ui/button';
import { Input } from '@/apps/admin/components/ui/input';
import { Label } from '@/apps/admin/components/ui/label';
import { Textarea } from '@/apps/admin/components/ui/textarea';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/apps/admin/components/ui/tabs';
import { Loader2, Upload, X, Globe, Plus, Trash2 } from 'lucide-react';
import { AdminRitual, RitualDb } from '@/apps/admin/hooks/useAdminRituals';
import { uploadToCloudinary } from '@meybeauty/cloudinary';
import Image from 'next/image';

interface RitualModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    ritual?: AdminRitual | null;
    onSave: (data: RitualDb) => Promise<void>;
}

type Step = { name: string; desc: string };

export default function RitualModal({ open, onOpenChange, ritual, onSave }: RitualModalProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [formData, setFormData] = useState<Partial<RitualDb>>({
        slug: '',
        image: '',
        defaultLocale: 'fr',
        translations: {
            fr: { title: '', subtitle: '', description: '', duration: '', difficulty: '', full_desc: '', steps: [], tips: [] },
            en: { title: '', subtitle: '', description: '', duration: '', difficulty: '', full_desc: '', steps: [], tips: [] },
            'es-PE': { title: '', subtitle: '', description: '', duration: '', difficulty: '', full_desc: '', steps: [], tips: [] },
        },
    });

    const [tipsInput, setTipsInput] = useState<Record<string, string>>({
        fr: '',
        en: '',
        'es-PE': '',
    });

    useEffect(() => {
        if (ritual) {
            const translations = ritual.translations || {};
            setFormData({
                slug: ritual.slug,
                image: ritual.image,
                defaultLocale: 'fr',
                translations: {
                    fr: translations.fr || { title: ritual.title, subtitle: ritual.subtitle, description: ritual.description, duration: ritual.duration, difficulty: ritual.difficulty, full_desc: '', steps: [], tips: [] },
                    en: translations.en || { title: '', subtitle: '', description: '', duration: '', difficulty: '', full_desc: '', steps: [], tips: [] },
                    'es-PE': translations['es-PE'] || { title: '', subtitle: '', description: '', duration: '', difficulty: '', full_desc: '', steps: [], tips: [] },
                },
            });
            setImagePreview(ritual.image);
            setTipsInput({
                fr: (translations.fr?.tips || []).join('\n'),
                en: (translations.en?.tips || []).join('\n'),
                'es-PE': (translations['es-PE']?.tips || []).join('\n'),
            });
        } else {
            setFormData({
                slug: '',
                image: '',
                defaultLocale: 'fr',
                translations: {
                    fr: { title: '', subtitle: '', description: '', duration: '', difficulty: '', full_desc: '', steps: [], tips: [] },
                    en: { title: '', subtitle: '', description: '', duration: '', difficulty: '', full_desc: '', steps: [], tips: [] },
                    'es-PE': { title: '', subtitle: '', description: '', duration: '', difficulty: '', full_desc: '', steps: [], tips: [] },
                },
            });
            setImagePreview(null);
            setTipsInput({ fr: '', en: '', 'es-PE': '' });
        }
        setImageFile(null);
    }, [ritual, open]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const updateTranslation = (lang: string, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            translations: {
                ...prev.translations!,
                [lang]: {
                    ...prev.translations![lang as keyof typeof prev.translations]!,
                    [field]: value,
                },
            },
        }));
    };

    const updateStep = (lang: string, index: number, field: 'name' | 'desc', value: string) => {
        setFormData(prev => {
            const trans = prev.translations!;
            const steps = [...(trans[lang as keyof typeof trans]?.steps || [])];
            steps[index] = { ...steps[index], [field]: value };
            return {
                ...prev,
                translations: {
                    ...trans,
                    [lang]: { ...trans[lang as keyof typeof trans]!, steps },
                },
            };
        });
    };

    const addStep = (lang: string) => {
        setFormData(prev => {
            const trans = prev.translations!;
            const steps = [...(trans[lang as keyof typeof trans]?.steps || []), { name: '', desc: '' }];
            return {
                ...prev,
                translations: {
                    ...trans,
                    [lang]: { ...trans[lang as keyof typeof trans]!, steps },
                },
            };
        });
    };

    const removeStep = (lang: string, index: number) => {
        setFormData(prev => {
            const trans = prev.translations!;
            const steps = [...(trans[lang as keyof typeof trans]?.steps || [])];
            steps.splice(index, 1);
            return {
                ...prev,
                translations: {
                    ...trans,
                    [lang]: { ...trans[lang as keyof typeof trans]!, steps },
                },
            };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            let imageUrl = formData.image;
            if (imageFile) {
                imageUrl = await uploadToCloudinary(imageFile, { folder: 'rituals' });
            }

            const langs = ['fr', 'en', 'es-PE'];
            const finalTranslations = { ...formData.translations! };
            langs.forEach(lang => {
                const tips = (tipsInput[lang] || '')
                    .split('\n')
                    .map(t => t.trim())
                    .filter(t => t.length > 0);
                finalTranslations[lang as keyof typeof finalTranslations] = {
                    ...finalTranslations[lang as keyof typeof finalTranslations]!,
                    tips,
                };
            });

            const finalData: RitualDb = {
                slug: formData.slug!,
                image: imageUrl || '',
                defaultLocale: 'fr',
                translations: finalTranslations,
            };

            await onSave(finalData);
            onOpenChange(false);
        } catch (err) {
            console.error(err);
            alert('Erreur lors de l\'enregistrement');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto font-sans p-0">
                <div className="p-6">
                    <DialogHeader className="mb-6">
                        <DialogTitle className="text-2xl font-bold">
                            {ritual ? 'Modifier le rituel' : 'Nouveau rituel'}
                        </DialogTitle>
                        <DialogDescription>
                            {ritual ? 'Modifiez les informations du rituel.' : 'Remplissez le formulaire pour ajouter un nouveau rituel.'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Column 1: Image & Meta */}
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <Label className="text-base font-bold">Image du rituel</Label>
                                    <div className="relative aspect-video rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden group">
                                        {imagePreview ? (
                                            <>
                                                <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => { setImageFile(null); setImagePreview(null); }}
                                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </>
                                        ) : (
                                            <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors">
                                                <Upload className="w-10 h-10 text-gray-300 mb-2" />
                                                <span className="text-sm text-gray-500 font-medium">Importer une image</span>
                                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                            </label>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t">
                                    <div className="space-y-2">
                                        <Label htmlFor="slug">Slug (ID unique)</Label>
                                        <Input
                                            id="slug"
                                            value={formData.slug}
                                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                            required
                                            placeholder="ex: rituel-detente-soir"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Column 2: Translations */}
                            <div className="md:col-span-2 space-y-6">
                                <Tabs defaultValue="fr">
                                    <TabsList className="grid grid-cols-3 w-full">
                                        <TabsTrigger value="fr" className="flex items-center gap-2">
                                            <Globe className="w-4 h-4" /> FR
                                        </TabsTrigger>
                                        <TabsTrigger value="en" className="flex items-center gap-2">
                                            <Globe className="w-4 h-4" /> EN
                                        </TabsTrigger>
                                        <TabsTrigger value="es-PE" className="flex items-center gap-2">
                                            <Globe className="w-4 h-4" /> ES
                                        </TabsTrigger>
                                    </TabsList>

                                    {(['fr', 'en', 'es-PE'] as const).map(lang => (
                                        <TabsContent key={lang} value={lang} className="space-y-4 mt-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Titre ({lang})</Label>
                                                    <Input
                                                        value={formData.translations?.[lang]?.title || ''}
                                                        onChange={(e) => updateTranslation(lang, 'title', e.target.value)}
                                                        placeholder="Titre du rituel"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Sous-titre ({lang})</Label>
                                                    <Input
                                                        value={formData.translations?.[lang]?.subtitle || ''}
                                                        onChange={(e) => updateTranslation(lang, 'subtitle', e.target.value)}
                                                        placeholder="Sous-titre"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Durée ({lang})</Label>
                                                    <Input
                                                        value={formData.translations?.[lang]?.duration || ''}
                                                        onChange={(e) => updateTranslation(lang, 'duration', e.target.value)}
                                                        placeholder="ex: 30 min"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Difficulté ({lang})</Label>
                                                    <Input
                                                        value={formData.translations?.[lang]?.difficulty || ''}
                                                        onChange={(e) => updateTranslation(lang, 'difficulty', e.target.value)}
                                                        placeholder="ex: Facile"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Description courte ({lang})</Label>
                                                <Textarea
                                                    value={formData.translations?.[lang]?.description || ''}
                                                    onChange={(e) => updateTranslation(lang, 'description', e.target.value)}
                                                    placeholder="Description pour la carte..."
                                                    rows={2}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Description complète ({lang})</Label>
                                                <Textarea
                                                    value={formData.translations?.[lang]?.full_desc || ''}
                                                    onChange={(e) => updateTranslation(lang, 'full_desc', e.target.value)}
                                                    placeholder="Description complète du rituel..."
                                                    rows={4}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Label>Étapes ({lang})</Label>
                                                    <button
                                                        type="button"
                                                        onClick={() => addStep(lang)}
                                                        className="flex items-center gap-1 text-sm text-[#523A28] hover:opacity-70"
                                                    >
                                                        <Plus className="w-4 h-4" /> Ajouter
                                                    </button>
                                                </div>
                                                {(formData.translations?.[lang]?.steps || []).map((step, i) => (
                                                    <div key={i} className="flex gap-2 items-start">
                                                        <span className="mt-2 text-sm font-bold text-gray-400 shrink-0">{i + 1}.</span>
                                                        <Input
                                                            value={step.name}
                                                            onChange={(e) => updateStep(lang, i, 'name', e.target.value)}
                                                            placeholder="Nom de l'étape"
                                                            className="flex-1"
                                                        />
                                                        <Input
                                                            value={step.desc}
                                                            onChange={(e) => updateStep(lang, i, 'desc', e.target.value)}
                                                            placeholder="Description"
                                                            className="flex-1"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeStep(lang, i)}
                                                            className="mt-1 p-1 text-red-500 hover:bg-red-50 rounded"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Conseils ({lang}) — Un par ligne</Label>
                                                <Textarea
                                                    value={tipsInput[lang] || ''}
                                                    onChange={(e) => setTipsInput(prev => ({ ...prev, [lang]: e.target.value }))}
                                                    placeholder="Conseil 1&#10;Conseil 2..."
                                                    rows={3}
                                                />
                                            </div>
                                        </TabsContent>
                                    ))}
                                </Tabs>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Annuler
                            </Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                Enregistrer
                            </Button>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
