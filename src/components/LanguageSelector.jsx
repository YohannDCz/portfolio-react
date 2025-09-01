'use client';

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage, useDirectionalClasses } from "@/contexts/LanguageContext";
import { ChevronDown, Globe } from "lucide-react";

export default function LanguageSelector({ variant = "default" }) {
  const { currentLang, languages, currentLanguage, switchLanguage } = useLanguage();
  const { getDirectionalClass, isRTL } = useDirectionalClasses();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant === "ghost" ? "ghost" : "outline"} 
          size="sm"
          className={`${getDirectionalClass("flex items-center gap-2")} ${
            variant === "minimal" ? "p-2" : ""
          }`}
        >
          {variant === "minimal" ? (
            <Globe className="h-4 w-4 no-rtl-transform" />
          ) : (
            <>
              <span className="text-lg no-rtl-transform">{currentLanguage?.flag}</span>
              <span className={getDirectionalClass("hidden sm:inline")}>
                {currentLanguage?.name}
              </span>
              <ChevronDown className="h-3 w-3 no-rtl-transform" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align={isRTL ? "start" : "end"}
        className="dropdown-menu-rtl"
      >
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => switchLanguage(language.code)}
            className={`${getDirectionalClass("flex items-center gap-3 cursor-pointer")} ${
              currentLang === language.code ? "bg-accent" : ""
            }`}
          >
            <span className="text-lg no-rtl-transform">{language.flag}</span>
            <span className={getDirectionalClass("flex-1 text-start")}>
              {language.name}
            </span>
            {language.dir === 'rtl' && (
              <span className={`text-xs text-muted-foreground ${getDirectionalClass("text-end")}`}>
                RTL
              </span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
