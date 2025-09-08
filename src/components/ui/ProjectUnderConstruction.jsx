'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Code, Hammer, Wrench } from "lucide-react";

export default function ProjectUnderConstruction({ 
  title = "Projet en construction", 
  description = "Ce projet est actuellement en développement. Revenez bientôt !",
  expectedDate = null,
  onBack = null 
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-background to-yellow-50 dark:from-orange-950/20 dark:via-background dark:to-yellow-950/20 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full"
      >
        <Card className="border-2 border-orange-200 dark:border-orange-800 shadow-2xl bg-background/90 backdrop-blur">
          <CardHeader className="text-center pb-4">
            {/* Animated construction icons */}
            <motion.div
              animate={{ 
                rotate: [0, 5, -5, 0],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="mb-4"
            >
              <div className="flex justify-center gap-3 mb-4">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ 
                    duration: 1.5,
                    repeat: Infinity,
                    delay: 0
                  }}
                >
                  <Hammer className="w-8 h-8 text-orange-500" />
                </motion.div>
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ 
                    duration: 1.5,
                    repeat: Infinity,
                    delay: 0.3
                  }}
                >
                  <Wrench className="w-8 h-8 text-orange-600" />
                </motion.div>
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ 
                    duration: 1.5,
                    repeat: Infinity,
                    delay: 0.6
                  }}
                >
                  <Code className="w-8 h-8 text-orange-700" />
                </motion.div>
              </div>
            </motion.div>

            <CardTitle className="text-2xl text-orange-600 dark:text-orange-400 mb-2">
              🚧 {title}
            </CardTitle>
          </CardHeader>

          <CardContent className="text-center space-y-6">
            <p className="text-muted-foreground leading-relaxed">
              {description}
            </p>

            {/* Progress bar animation */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Progression</span>
                <span>En cours...</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "60%" }}
                  transition={{ 
                    duration: 2,
                    ease: "easeOut"
                  }}
                />
              </div>
            </div>

            {expectedDate && (
              <div className="flex items-center justify-center gap-2 text-sm text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 p-3 rounded-lg">
                <Calendar className="w-4 h-4" />
                <span>Livraison prévue : {expectedDate}</span>
              </div>
            )}

            {/* Action button */}
            {onBack && (
              <Button 
                onClick={onBack}
                variant="outline" 
                className="gap-2 border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-300 dark:hover:bg-orange-950/30"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </Button>
            )}

            {/* Fun detail */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="pt-4 border-t border-orange-200 dark:border-orange-800"
            >
              <p className="text-xs text-muted-foreground">
                💻 Nos développeurs travaillent dur pour vous offrir la meilleure expérience
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
