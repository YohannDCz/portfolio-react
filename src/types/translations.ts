import { TRANSLATIONS } from '@/app/assets/translations';

export type TranslationContent = (typeof TRANSLATIONS)[keyof typeof TRANSLATIONS];
