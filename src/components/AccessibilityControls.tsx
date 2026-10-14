/**
 * Accessibility Controls Component
 * Meets WCAG AA, Indian script font sizing, and high contrast needs.
 */

import { Eye, Type, Volume2, Sparkles, Moon, Sun } from 'lucide-react';
import type { AccessibilitySettings } from '../types';

interface AccessibilityControlsProps {
  settings: AccessibilitySettings;
  onChange: (settings: AccessibilitySettings) => void;
}

export function AccessibilityControls({ settings, onChange }: AccessibilityControlsProps) {
  const fontSizes: Array<{ id: AccessibilitySettings['fontSize']; label: string }> = [
    { id: 'sm', label: 'ସାଧାରଣ (A)' },
    { id: 'base', label: 'ମଧ୍ୟମ (A+)' },
    { id: 'lg', label: 'ବଡ଼ (A++)' },
    { id: 'xl', label: 'ଅତି ବଡ଼ (A+++)' },
  ];

  return (
    <div className="space-y-4">
      {/* Font Size Selector */}
      <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          <Type className="w-4 h-4 text-teal-600" />
          <span>ଅକ୍ଷର ଆକାର (Text Scaling)</span>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
          ଓଡ଼ିଆ ମାତ୍ରା ଓ ଯୁକ୍ତାକ୍ଷର ସ୍ପଷ୍ଟ ପଢ଼ିବା ପାଇଁ ଅକ୍ଷର ବଡ଼ କରନ୍ତୁ।
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {fontSizes.map((f) => (
            <button
              key={f.id}
              onClick={() => onChange({ ...settings, fontSize: f.id })}
              className={`p-2 rounded-lg text-xs font-semibold border transition text-center ${
                settings.fontSize === f.id
                  ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200'
                  : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* High Contrast & Display Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* High Contrast */}
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-zinc-100">
              <Eye className="w-4 h-4 text-teal-600" />
              <span>ଉଚ୍ଚ କଣ୍ଟ୍ରାଷ୍ଟ୍ ମୋଡ୍ (High Contrast)</span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              ଖରାରେ ସ୍ପଷ୍ଟ ଦେଖିବା ପାଇଁ (Sunlight reading)
            </p>
          </div>
          <button
            onClick={() => onChange({ ...settings, highContrast: !settings.highContrast })}
            className={`w-11 h-6 rounded-full transition p-0.5 ${
              settings.highContrast ? 'bg-teal-600' : 'bg-zinc-300 dark:bg-zinc-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition transform ${
                settings.highContrast ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Dyslexia / Indian Script Spacing */}
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-zinc-100">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>ବର୍ଦ୍ଧିତ ଧାଡ଼ି ବ୍ୟବଧାନ (Matra Line Spacing)</span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              1.75x ଧାଡ଼ି ବ୍ୟବଧାନ ଯାହା ଯୁକ୍ତାକ୍ଷର କଟିବାକୁ ରୋକିଥାଏ
            </p>
          </div>
          <button
            onClick={() => onChange({ ...settings, dyslexiaSpacing: !settings.dyslexiaSpacing })}
            className={`w-11 h-6 rounded-full transition p-0.5 ${
              settings.dyslexiaSpacing ? 'bg-teal-600' : 'bg-zinc-300 dark:bg-zinc-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition transform ${
                settings.dyslexiaSpacing ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
