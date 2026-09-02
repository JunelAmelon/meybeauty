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
import { Loader2, Upload, X, Globe } from 'lucide-react';
import { AdminBlog, BlogDb } from '@/apps/admin/hooks/useAdminBlogs';
import { uploadToCloudinary } from '@meybeauty/cloudinary';
import Image from 'next/image';

interface BlogModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    blog?: AdminBlog | null;
    onSave: (data: BlogDb) => Promise<void>;
}

export default function BlogModal({ open, onOpenChange, blog, onSave }: BlogModalProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [formData, setFormData] = useState<Partial<BlogDb>>({
        slug: '',
        image: '',
        date: '',
        readTime: '',
        category: '',
        author: { name: '', role: '', avatar: '' },
        defaultLocale: 'fr',
        translations: {
            fr: { title: '', excerpt: '', content: [] },
            en: { title: '', excerpt: '', content: [] },
            'es-PE': { title: '', excerpt: '', content: [] },
        },
    });

    const [contentInput, setContentInput] = useState<Record<string, string>>({
        fr: '',
        en: '',
        'es-PE': '',
    });

    useEffect(() => {
        if (blog) {
            const translations = blog.translations || {};
            setFormData({
                slug: blog.slug,
                image: blog.image,
                date: blog.date,
                readTime: blog.readTime,
                category: blog.category,
                author: blog.author || { name: '', role: '', avatar: '' },
                defaultLocale: 'fr',
                translations: {
                    fr: translations.fr || { title: blog.title, excerpt: blog.excerpt, content: [] },
                    en: translations.en || { title: '', excerpt: '', content: [] },
                    'es-PE': translations['es-PE'] || { title: '', excerpt: '', content: [] },
                },
            });
            setImagePreview(blog.image);
            setContentInput({
                fr: (translations.fr?.content || []).join('\n\n'),
                en: (translations.en?.content || []).join('\n\n'),
                'es-PE': (translations['es-PE']?.content || []).join('\n\n'),
            });
        } else {
            setFormData({
                slug: '',
                image: '',
                date: '',
                readTime: '',
                category: '',
                author: { name: '', role: '', avatar: '' },
                defaultLocale: 'fr',
                translations: {
                    fr: { title: '', excerpt: '', content: [] },
                    en: { title: '', excerpt: '', content: [] },
                    'es-PE': { title: '', excerpt: '', content: [] },
                },
            });
            setImagePreview(null);
            setContentInput({ fr: '', en: '', 'es-PE': '' });
        }
        setImageFile(null);
    }, [blog, open]);

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

    const updateContent = (lang: string, value: string) => {
        setContentInput(prev => ({ ...prev, [lang]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            let imageUrl = formData.image;
            if (imageFile) {
                imageUrl = await uploadToCloudinary(imageFile, { folder: 'blog' });
            }

            const langs = ['fr', 'en', 'es-PE'];
            const finalTranslations = { ...formData.translations! };
            langs.forEach(lang => {
                const content = contentInput[lang]
                    .split('\n\n')
                    .map(p => p.trim())
                    .filter(p => p.length > 0);
                finalTranslations[lang as keyof typeof finalTranslations] = {
                    ...finalTranslations[lang as keyof typeof finalTranslations]!,
                    content,
                };
            });

            const finalData: BlogDb = {
                slug: formData.slug!,
                image: imageUrl || '',
                date: formData.date || '',
                readTime: formData.readTime || '',
                category: formData.category || '',
                author: formData.author,
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
                            {blog ? 'Modifier l\'article' : 'Nouvel article'}
                        </DialogTitle>
                        <DialogDescription>
                            {blog ? 'Modifiez les informations de l\'article de blog.' : 'Remplissez le formulaire pour ajouter un nouvel article.'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Column 1: Image & Meta */}
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <Label className="text-base font-bold">Image de l'article</Label>
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
                                            placeholder="ex: rituel-bien-etre-hiver"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="category">Catégorie</Label>
                                        <Input
                                            id="category"
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            required
                                            placeholder="ex: Soins, Bien-être..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="date">Date</Label>
                                            <Input
                                                id="date"
                                                value={formData.date}
                                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                                placeholder="ex: 15/02/2025"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="readTime">Temps de lecture</Label>
                                            <Input
                                                id="readTime"
                                                value={formData.readTime}
                                                onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                                                placeholder="ex: 5 min"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="authorName">Auteur — Nom</Label>
                                        <Input
                                            id="authorName"
                                            value={formData.author?.name || ''}
                                            onChange={(e) => setFormData({ ...formData, author: { ...formData.author!, name: e.target.value } })}
                                            placeholder="ex: Mey Beauty"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="authorRole">Auteur — Rôle</Label>
                                        <Input
                                            id="authorRole"
                                            value={formData.author?.role || ''}
                                            onChange={(e) => setFormData({ ...formData, author: { ...formData.author!, role: e.target.value } })}
                                            placeholder="ex: Esthéticienne"
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
                                            <div className="space-y-2">
                                                <Label>Titre ({lang})</Label>
                                                <Input
                                                    value={formData.translations?.[lang]?.title || ''}
                                                    onChange={(e) => updateTranslation(lang, 'title', e.target.value)}
                                                    placeholder="Titre de l'article"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Extrait ({lang})</Label>
                                                <Textarea
                                                    value={formData.translations?.[lang]?.excerpt || ''}
                                                    onChange={(e) => updateTranslation(lang, 'excerpt', e.target.value)}
                                                    placeholder="Résumé court de l'article..."
                                                    rows={3}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Contenu ({lang}) — Séparez les paragraphes par une ligne vide</Label>
                                                <Textarea
                                                    value={contentInput[lang] || ''}
                                                    onChange={(e) => updateContent(lang, e.target.value)}
                                                    placeholder="Paragraphe 1&#10;&#10;Paragraphe 2&#10;&#10;Paragraphe 3..."
                                                    rows={12}
                                                    className="font-mono text-sm"
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
