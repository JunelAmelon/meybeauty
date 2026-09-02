'use client';

import { useState, useEffect, useMemo } from 'react';
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/apps/admin/components/ui/select';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/apps/admin/components/ui/tabs';
import { Loader2, Upload, X, Globe } from 'lucide-react';
import { AdminProduct, ProductDb } from '@/apps/admin/hooks/useAdminProducts';
import { useTranslations } from 'next-intl';
import { uploadToCloudinary } from '@meybeauty/cloudinary';
import Image from 'next/image';

interface ProductModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product?: AdminProduct | null;
    categories: { value: string; label: string }[];
    onSave: (data: ProductDb) => Promise<void>;
}

export default function ProductModal({ open, onOpenChange, product, categories, onSave }: ProductModalProps) {
    const t = useTranslations('admin.products');
    const [isSaving, setIsSaving] = useState(false);

    // Image state
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Category state
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [isOtherCategory, setIsOtherCategory] = useState(false);
    const [newCategorySlug, setNewCategorySlug] = useState('');

    // Form state
    const [formData, setFormData] = useState<Partial<ProductDb>>({
        slug: '',
        category: '',
        price: 0,
        stock: 0,
        image: '',
        translations: {
            fr: { name: '', desc: '', long_desc: '', category: '' },
            en: { name: '', desc: '', long_desc: '', category: '' },
            'es-PE': { name: '', desc: '', long_desc: '', category: '' }
        }
    });

    useEffect(() => {
        if (product) {
            setFormData({
                slug: product.slug,
                category: product.category,
                price: product.price,
                stock: product.stock,
                image: product.image,
                volume: product.volume,
                translations: product.translations || {
                    fr: { name: product.name, desc: product.desc, long_desc: product.long_desc || '', category: product.categoryLabel, usage: product.usage || '', ingredient_base: product.ingredient_base || '' },
                    en: { name: '', desc: '', long_desc: '', category: '', usage: '', ingredient_base: '' },
                    'es-PE': { name: '', desc: '', long_desc: '', category: '', usage: '', ingredient_base: '' }
                }
            });
            setSelectedCategory(product.category);
            setIsOtherCategory(false);
            setImagePreview(product.image);
            setImageFile(null);
        } else {
            setFormData({
                slug: '',
                category: '',
                price: 0,
                stock: 0,
                image: '',
                volume: '',
                translations: {
                    fr: { name: '', desc: '', long_desc: '', category: '', usage: '', ingredient_base: '' },
                    en: { name: '', desc: '', long_desc: '', category: '', usage: '', ingredient_base: '' },
                    'es-PE': { name: '', desc: '', long_desc: '', category: '', usage: '', ingredient_base: '' }
                }
            });
            setSelectedCategory('');
            setIsOtherCategory(false);
            setNewCategorySlug('');
            setImagePreview(null);
            setImageFile(null);
        }
    }, [product, open]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleCategoryChange = (val: string) => {
        if (val === 'autre') {
            setIsOtherCategory(true);
            setSelectedCategory('autre');
        } else {
            setIsOtherCategory(false);
            setSelectedCategory(val);
            setFormData(prev => ({ ...prev, category: val }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            let imageUrl = formData.image;

            if (imageFile) {
                imageUrl = await uploadToCloudinary(imageFile, { folder: 'products' });
            }

            const finalCategory = isOtherCategory ? newCategorySlug : selectedCategory;

            const finalData = {
                ...formData,
                image: imageUrl,
                category: finalCategory,
            };

            await onSave(finalData as ProductDb);
            onOpenChange(false);
        } catch (err) {
            console.error(err);
            alert('Erreur lors de l\'enregistrement');
        } finally {
            setIsSaving(false);
        }
    };

    // Helper for updating translations
    const updateTranslation = (lang: string, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            translations: {
                ...prev.translations!,
                [lang]: {
                    ...prev.translations![lang as keyof typeof prev.translations]!,
                    [field]: value
                }
            }
        }));
    };

    const filteredCategories = useMemo(() => {
        return categories.filter(c => c.value !== 'Toutes');
    }, [categories]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto font-sans p-0">
                <div className="p-6">
                    <DialogHeader className="mb-6">
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            {product ? t('editProduct') || 'Modifier le produit' : t('newProduct')}
                        </DialogTitle>
                        <DialogDescription>
                            {product ? 'Modifiez les informations détaillées du produit.' : 'Remplissez le formulaire pour ajouter un nouveau produit au catalogue.'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Column 1: Image & Basic Info */}
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <Label className="text-base font-bold">{t('form.imageLabel')}</Label>
                                    <div className="relative aspect-square rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden group">
                                        {imagePreview ? (
                                            <>
                                                <Image src={imagePreview} alt="Preview" fill className="object-contain p-4" />
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
                                                <span className="text-sm text-gray-500 font-medium">{t('form.importImage')}</span>
                                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                            </label>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t">
                                    <div className="space-y-2">
                                        <Label htmlFor="slug">{t('form.slugLabel')}</Label>
                                        <Input
                                            id="slug"
                                            value={formData.slug}
                                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                            required
                                            placeholder={t('form.slugPlaceholder')}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="price">{t('form.priceLabel')}</Label>
                                            <Input
                                                id="price"
                                                type="number"
                                                step="0.01"
                                                value={formData.price ?? ''}
                                                onChange={(e) => setFormData({ ...formData, price: e.target.value === '' ? undefined : parseFloat(e.target.value) })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="stock">{t('form.stockLabel')}</Label>
                                            <Input
                                                id="stock"
                                                type="number"
                                                value={formData.stock ?? ''}
                                                onChange={(e) => setFormData({ ...formData, stock: e.target.value === '' ? undefined : parseInt(e.target.value) })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="volume">{t('form.volumeLabel') || 'Volume'}</Label>
                                        <Input
                                            id="volume"
                                            value={formData.volume}
                                            onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                                            placeholder="ex: 150g"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Column 2 & 3: Multilingual & Category */}
                            <div className="md:col-span-2 space-y-6">
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">
                                    <Label className="text-base font-bold flex items-center gap-2">
                                        <Package className="w-5 h-5 text-[#523A28]" />
                                        {t('form.classificationLabel')}
                                    </Label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>{t('form.categoryLabel')}</Label>
                                            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t('form.selectCategoryPlaceholder')} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {filteredCategories.map(cat => (
                                                        <SelectItem key={cat.value} value={cat.value}>
                                                            {cat.label}
                                                        </SelectItem>
                                                    ))}
                                                    <SelectItem value="autre">{t('form.other')}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {isOtherCategory && (
                                            <div className="space-y-2 animate-in slide-in-from-left duration-200">
                                                <Label htmlFor="newCategory">{t('form.newCategory')}</Label>
                                                <Input
                                                    id="newCategory"
                                                    value={newCategorySlug}
                                                    onChange={(e) => setNewCategorySlug(e.target.value)}
                                                    placeholder="ex: nouvelle-cat"
                                                    required
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-base font-bold flex items-center gap-2">
                                        <Globe className="w-5 h-5 text-[#523A28]" />
                                        {t('form.contentLabel')}
                                    </Label>
                                    <Tabs defaultValue="fr" className="w-full">
                                        <TabsList className="grid w-full grid-cols-3">
                                            <TabsTrigger value="fr">{t('form.tabFR')}</TabsTrigger>
                                            <TabsTrigger value="en">{t('form.tabEN')}</TabsTrigger>
                                            <TabsTrigger value="es-PE">{t('form.tabES')}</TabsTrigger>
                                        </TabsList>

                                        {['fr', 'en', 'es-PE'].map((lang) => (
                                            <TabsContent key={lang} value={lang} className="space-y-4 pt-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor={`name_${lang}`}>{t('form.nameLabel')}</Label>
                                                    <Input
                                                        id={`name_${lang}`}
                                                        value={formData.translations?.[lang as keyof typeof formData.translations]?.name}
                                                        onChange={(e) => updateTranslation(lang, 'name', e.target.value)}
                                                        required={lang === 'fr'}
                                                        placeholder={lang === 'fr' ? t('form.namePlaceholderFR') : t('form.namePlaceholder')}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`cat_label_${lang}`}>{t('form.catLabelLabel')} ({lang.toUpperCase()})</Label>
                                                    <Input
                                                        id={`cat_label_${lang}`}
                                                        value={formData.translations?.[lang as keyof typeof formData.translations]?.category}
                                                        onChange={(e) => updateTranslation(lang, 'category', e.target.value)}
                                                        required={lang === 'fr' || isOtherCategory}
                                                        placeholder={t('form.catLabelPlaceholder')}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`desc_${lang}`}>{t('form.shortDescLabel')}</Label>
                                                    <Textarea
                                                        id={`desc_${lang}`}
                                                        value={formData.translations?.[lang as keyof typeof formData.translations]?.desc}
                                                        onChange={(e) => updateTranslation(lang, 'desc', e.target.value)}
                                                        required={lang === 'fr'}
                                                        className="min-h-[100px]"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`long_desc_${lang}`}>{t('form.longDescLabel')}</Label>
                                                    <Textarea
                                                        id={`long_desc_${lang}`}
                                                        value={formData.translations?.[lang as keyof typeof formData.translations]?.long_desc}
                                                        onChange={(e) => updateTranslation(lang, 'long_desc', e.target.value)}
                                                        className="min-h-[150px]"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor={`usage_${lang}`}>{t('form.usageLabel') || 'Conseils d\'utilisation'}</Label>
                                                        <Textarea
                                                            id={`usage_${lang}`}
                                                            value={formData.translations?.[lang as keyof typeof formData.translations]?.usage}
                                                            onChange={(e) => updateTranslation(lang, 'usage', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor={`ingredient_${lang}`}>{t('form.ingredientLabel') || 'Ingrédient de base'}</Label>
                                                        <Textarea
                                                            id={`ingredient_${lang}`}
                                                            value={formData.translations?.[lang as keyof typeof formData.translations]?.ingredient_base}
                                                            onChange={(e) => updateTranslation(lang, 'ingredient_base', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </TabsContent>
                                        ))}
                                    </Tabs>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="border-t pt-6">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                {t('actions.cancel')}
                            </Button>
                            <Button type="submit" disabled={isSaving} className="bg-[#523A28] hover:bg-[#3A2819]">
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        {t('form.saving')}
                                    </>
                                ) : t('form.save')}
                            </Button>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Missing icon import
function Package(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16.5 9.4 7.5 4.21" />
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.29 7 12 12 20.71 7" />
            <line x1="12" y1="22" x2="12" y2="12" />
        </svg>
    )
}
