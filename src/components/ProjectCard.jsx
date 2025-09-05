// ——————————————————————————————————————————————
// Composant ProjectCard avec support RTL
// ——————————————————————————————————————————————
function ProjectCard({ project, currentLang, t, isAdminMode = false }) {
  const { getDirectionalClass, isRTL } = useDirectionalClasses();
  

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
      <Card className="h-full relative overflow-hidden">
        {/* Admin Edit Button - Only show in admin mode */}
        {isAdminMode && <ProjectEditButton projectId={project.id} />}
        
        {project.status === 'in_progress' && (
          <div className="absolute top-2 left-2 z-10">
            <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700">
              {t.inProgress}
            </Badge>
          </div>
        )}
        {project.status === 'to_deploy' && (
          <div className="absolute top-2 left-2 z-10">
            <Badge variant="outline" className="text-xs bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700">
              {t.toDeploy}
            </Badge>
          </div>
        )}
        {/* Image du projet */}
        <div className="h-48 rounded-t-xl overflow-hidden bg-gradient-to-br from-gray-300 via-gray-200 to-gray-100">
          <div className="w-full h-full relative">
            {/* Image décalée d'un tiers */}
            <div className="absolute inset-0 transform -translate-y-10">
            <ProjectImage
              src={getPublicImageUrl(project.image_url)}
              alt={getLocalizedText(project, 'title', currentLang)}
                className="object-cover rounded-lg shadow-md transition-transform duration-300 hover:scale-105"
                fallbackGradient="from-primary/20 to-primary/10"
            />
          </div>
          </div>
        </div>
        <CardHeader className="pb-2">
          <div className={`${getDirectionalClass("flex items-start justify-between")} gap-2`}>
                <div className="flex-1">
              <CardTitle className="text-lg">{getLocalizedText(project, 'title', currentLang)}</CardTitle>
              <CardDescription className="line-clamp-2 min-h-[2.5rem] mb-2">{getLocalizedText(project, 'description', currentLang)}</CardDescription>
                </div>
                {project.stars > 0 && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Star className="h-4 w-4 mr-1" /> {project.stars}
                  </div>
                )}
              </div>
            </CardHeader>
        <CardContent className="flex flex-col h-full">
          <div className={`${getDirectionalClass("flex flex-wrap gap-1.5")} mb-4 min-h-[3.5rem] content-start flex-1`}>
            {(Array.isArray(project.category) ? project.category : [project.category]).map((cat) => (
              <Badge key={`${project.id}-category-${cat}`} variant="default" className="rounded-full capitalize h-6 px-2.5 text-xs flex-shrink-0">{cat}</Badge>
            ))}
            {project.tags?.slice(0, 8).map((tag) => (
              <Badge key={tag} variant="secondary" className="rounded-full h-6 px-2.5 text-xs flex-shrink-0 max-w-[120px] truncate">{tag}</Badge>
            ))}
            {project.tags?.length > 8 && (
              <Badge variant="outline" className="rounded-full h-6 px-2.5 text-xs flex-shrink-0">
                +{project.tags.length - 8}
              </Badge>
            )}
          </div>
          <div className={`${getDirectionalClass("flex gap-2")} mt-auto pt-3 border-t bg-red-100 p-2`}>
              {/* Voir button - always displayed, takes full width */}
              <a 
                href={project.link && project.link !== '#' ? project.link : '#'} 
                target={project.link && project.link !== '#' ? "_blank" : "_self"} 
                rel="noopener noreferrer" 
                className="flex-1"
              >
                <Button 
                  size="sm" 
                  variant="outline" 
                  className={`w-full ${getDirectionalClass("flex items-center justify-center")}`}
                  disabled={!project.link || project.link === '#'}
                >
                  <Globe className={`${isRTL ? 'ml-2' : 'mr-2'} w-4 h-4 no-rtl-transform`} />
                  {t.see}
                </Button>
              </a>
              
              {/* GitHub icon - only when github_url exists */}
              {project.github_url && (
                <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm" className="no-rtl-transform px-3">
                    <Github className="w-4 h-4" />
                  </Button>
                </a>
              )}
              
              {/* Figma icon - only when figma_url exists */}
              {project.figma_url && (
                <a href={project.figma_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm" className="no-rtl-transform px-3">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M15.852 8.981h-4.588V0h4.588c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.491-4.49 4.491zM12.735 7.51h3.117c1.665 0 3.019-1.355 3.019-3.019s-1.354-3.019-3.019-3.019h-3.117V7.51zm0 1.471H8.148c-2.476 0-4.49-2.015-4.49-4.491S5.672 0 8.148 0h4.588v8.981zm-4.587-7.51c-1.665 0-3.019 1.355-3.019 3.019s1.354 3.02 3.019 3.02h3.117V1.471H8.148zm4.587 15.019H8.148c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h4.588v8.98zM8.148 8.981c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h3.117V8.981H8.148zM8.172 24c-2.489 0-4.515-2.014-4.515-4.49s2.014-4.49 4.49-4.49h4.588v4.441c0 2.503-2.047 4.539-4.563 4.539zm-.024-7.51a3.023 3.023 0 0 0-3.019 3.019c0 1.665 1.365 3.019 3.044 3.019 1.705 0 3.093-1.376 3.093-3.068V16.49H8.148zM24 12.981c0 2.476-2.014 4.49-4.49 4.49s-4.49-2.014-4.49-4.49 2.014-4.49 4.49-4.49 4.49 2.014 4.49 4.49zm-4.49-3.019c-1.665 0-3.019 1.355-3.019 3.019s1.354 3.019 3.019 3.019 3.019-1.355 3.019-3.019-1.354-3.019-3.019-3.019z"/>
                    </svg>
                  </Button>
                </a>
              )}
            </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
