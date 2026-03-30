import React from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiCheckCircle, FiClock } from "react-icons/fi";

interface OnboardingStepProps {
  title: string;
  description: string;
  linkText: string;
  linkPath: string;
  isCompleted: boolean;
  onNext: () => void;
  onBack?: () => void;
}

const OnboardingStep: React.FC<OnboardingStepProps> = ({
  title,
  description,
  linkText,
  linkPath,
  isCompleted,
  onNext,
  onBack,
}) => {
  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-4">
          <div className={`flex h-10 w-10 items-center justify-center rounded-2xl shadow-sm ${
            isCompleted ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600"
          }`}>
            {isCompleted ? <FiCheckCircle size={20} /> : <FiClock size={20} />}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-500">
              {isCompleted ? "Step completed" : "Action required"}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6 mb-8 text-center sm:text-left">
          <p className="text-slate-600 leading-relaxed max-w-2xl">
            {description}
          </p>
          
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
            <Link
              to={linkPath}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-lg active:scale-95 w-full sm:w-auto justify-center"
            >
              {linkText}
              <FiArrowRight />
            </Link>
            
            {isCompleted && (
              <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                <FiCheckCircle />
                Verified
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-6">
        {onBack ? (
          <button
            onClick={onBack}
            className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            ← Back
          </button>
        ) : (
          <div />
        )}
        <button
          onClick={onNext}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-900 transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-95"
        >
          {isCompleted ? "Continue" : "Skip for now"}
        </button>
      </div>
    </div>
  );
};

export default OnboardingStep;
