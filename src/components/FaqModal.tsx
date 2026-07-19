import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, X, ChevronDown } from 'lucide-react';
import { TRANSLATIONS, Language } from '../translations';

interface FaqModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export default function FaqModal({
  isOpen,
  onClose,
  language
}: FaqModalProps) {
  const t = TRANSLATIONS[language];
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  if (!isOpen) return null;

  const faqs = [
    { q: t.faqQuestion1, a: t.faqAnswer1 },
    { q: t.faqQuestion2, a: t.faqAnswer2 },
    { q: t.faqQuestion3, a: t.faqAnswer3 }
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-100 shadow-2xl relative"
      >
        <button
          id="faq-close-btn"
          onClick={onClose}
          className="absolute right-4 top-4 p-2 bg-slate-850 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl">
            <HelpCircle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-display tracking-tight text-white">
              {t.faqTitle}
            </h3>
            <p className="text-xs text-slate-400">
              Fanampiana sy antontan-taratasy ho an'ny DEVWEB IA
            </p>
          </div>
        </div>

        {/* Accordion Questions */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpenItem = openIdx === idx;
            return (
              <div 
                key={idx}
                className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/30"
              >
                <button
                  id={`faq-toggle-btn-${idx}`}
                  onClick={() => setOpenIdx(isOpenItem ? null : idx)}
                  className="w-full p-4 text-left flex justify-between items-center gap-4 cursor-pointer hover:bg-slate-800/40 transition-colors"
                >
                  <span className="text-xs font-bold text-slate-200">
                    {faq.q}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpenItem ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isOpenItem && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 pt-0 border-t border-slate-800/50 text-[11px] text-slate-400 leading-relaxed whitespace-pre-line">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </motion.div>
    </div>
  );
}
