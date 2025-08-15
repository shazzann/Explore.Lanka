import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  steps,
  currentStep,
  className
}) => {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div className="flex items-center w-full">
              <motion.div
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full border-2 font-semibold text-sm',
                  index < currentStep
                    ? 'bg-primary border-primary text-primary-foreground'
                    : index === currentStep
                    ? 'border-primary text-primary bg-primary/10'
                    : 'border-muted-foreground/30 text-muted-foreground'
                )}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                {index < currentStep ? '✓' : index + 1}
              </motion.div>
              
              {index < steps.length - 1 && (
                <div className="flex-1 h-1 mx-2 bg-muted-foreground/20 rounded">
                  <motion.div
                    className="h-full bg-primary rounded"
                    initial={{ width: '0%' }}
                    animate={{ 
                      width: index < currentStep ? '100%' : '0%' 
                    }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  />
                </div>
              )}
            </div>
            
            <motion.span
              className={cn(
                'text-xs mt-2 text-center',
                index <= currentStep ? 'text-foreground' : 'text-muted-foreground'
              )}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              {step}
            </motion.span>
          </div>
        ))}
      </div>
    </div>
  );
};

export { ProgressIndicator };