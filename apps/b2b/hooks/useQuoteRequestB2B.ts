'use client';

import { useState, useCallback, useMemo } from 'react';
import { uploadToCloudinary } from '@meybeauty/cloudinary';
import { addDoc, collection, db } from '@meybeauty/firebase';
import { useProductsB2B, type ProductB2B } from './useProductsB2B';

export type QuoteForm = {
  subject: string;
  type: string;
  date?: string;
  description: string;
  quantity?: number;
  budget?: number;
};

export type QuoteProduct = {
  id: string;
  nom: string;
  reference: string;
  prixHT: number;
  quantite: number;
};

export type QuoteFile = {
  id: string;
  name: string;
  size: number;
  status: 'idle' | 'uploading' | 'done' | 'error';
  url?: string;
  error?: string;
};

type SubmitResult = {
  id: string;
  payload: {
    form: QuoteForm;
    products: QuoteProduct[];
    totalHT: number;
    totalTTC: number;
    attachments: QuoteFile[];
    submittedAt: string;
  };
};

export function useQuoteRequestB2B() {
  const { products, loading: loadingProducts, error: productsError } = useProductsB2B();
  const [form, setForm] = useState<QuoteForm>({
    subject: '',
    type: '',
    date: '',
    description: '',
    quantity: undefined,
    budget: undefined,
  });
  const [selectedProducts, setSelectedProducts] = useState<QuoteProduct[]>([]);
  const [files, setFiles] = useState<QuoteFile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setFormField = useCallback(<K extends keyof QuoteForm>(key: K, value: QuoteForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const addProduct = useCallback((product: ProductB2B, quantity = 1) => {
    setSelectedProducts((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      if (existing) {
        return prev.map((p) =>
          p.id === product.id ? { ...p, quantite: p.quantite + quantity } : p
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          nom: product.nom,
          reference: product.reference,
          prixHT: product.prixHT,
          quantite: quantity,
        },
      ];
    });
  }, []);

  const updateProductQty = useCallback((productId: string, quantity: number) => {
    setSelectedProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, quantite: Math.max(1, quantity) } : p))
    );
  }, []);

  const removeProduct = useCallback((productId: string) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  const totalHT = useMemo(
    () => selectedProducts.reduce((sum, p) => sum + p.prixHT * p.quantite, 0),
    [selectedProducts]
  );
  const totalTTC = useMemo(() => totalHT * 1.2, [totalHT]); // TVA 20% par défaut

  const uploadFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const arrayFiles = Array.from(fileList);
      const newFiles: QuoteFile[] = arrayFiles.map((f) => ({
        id: `${f.name}-${f.size}-${f.lastModified}-${Math.random().toString(16).slice(2)}`,
        name: f.name,
        size: f.size,
        status: 'uploading',
      }));
      setFiles((prev) => [...prev, ...newFiles]);

      for (let i = 0; i < arrayFiles.length; i += 1) {
        const file = arrayFiles[i];
        const fileId = newFiles[i].id;
        try {
          const url = await uploadToCloudinary(file, { folder: 'quotes' });
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileId ? { ...f, status: 'done', url, error: undefined } : f
            )
          );
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Échec de l’upload';
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileId ? { ...f, status: 'error', error: message } : f
            )
          );
        }
      }
    },
    [setFiles]
  );

  const removeFile = useCallback((fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  }, []);

  const handleSubmit = useCallback(async (): Promise<SubmitResult | null> => {
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      if (!form.subject || !form.type || !form.description) {
        throw new Error('Veuillez remplir les champs obligatoires');
      }
      const pendingUploads = files.some((f) => f.status === 'uploading');
      if (pendingUploads) {
        throw new Error('Attendez la fin des uploads avant de soumettre');
      }

      const payload: SubmitResult['payload'] = {
        form,
        products: selectedProducts,
        totalHT,
        totalTTC,
        attachments: files,
        submittedAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'quoteRequestsB2B'), {
        ...payload,
        status: 'pending',
      });

      setSuccess(true);
      return { id: docRef.id, payload };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors de l’envoi du devis';
      setError(message);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [form, selectedProducts, files, totalHT, totalTTC]);

  const reset = useCallback(() => {
    setForm({
      subject: '',
      type: '',
      date: '',
      description: '',
      quantity: undefined,
      budget: undefined,
    });
    setSelectedProducts([]);
    setFiles([]);
    setSuccess(false);
    setError(null);
  }, []);

  return {
    products,
    loadingProducts,
    productsError,
    form,
    setFormField,
    selectedProducts,
    addProduct,
    updateProductQty,
    removeProduct,
    totalHT,
    totalTTC,
    files,
    uploadFiles,
    removeFile,
    submitting,
    success,
    error,
    handleSubmit,
    reset,
  };
}
