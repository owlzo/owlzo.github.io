import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { WorkItem } from "@/content/profile";

interface ProjectState {
  project: WorkItem | null;
  openProject: (work: WorkItem) => void;
  closeProject: () => void;
}

const ProjectContext = createContext<ProjectState | null>(null);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [project, setProject] = useState<WorkItem | null>(null);

  const openProject = useCallback((work: WorkItem) => setProject(work), []);
  const closeProject = useCallback(() => setProject(null), []);

  const value = useMemo(
    () => ({ project, openProject, closeProject }),
    [project, openProject, closeProject],
  );

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}
