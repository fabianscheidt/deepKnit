import { Knitpaint } from '../knitpaint';

export enum ProjectStage {
  Setup = 0,
  Patterns = 1,
  Assembly = 2
}

/**
 * A project represents the current state of the editor. The class is designed to be immuatble. Therefore mutating methods return new
 * instances of Project.
 */
export class Project {
  public readonly stage: ProjectStage = ProjectStage.Setup;
  public readonly patterns: Knitpaint[] = [];
  public readonly assembly: Knitpaint;

  public static fromJSON(json: any): Project {
    const stage = json.stage;
    const patterns = json.patterns.map((pattern) => Knitpaint.fromJSON(pattern));
    const assembly = Knitpaint.fromJSON(json.assembly);
    return new Project(stage, patterns, assembly);
  }

  constructor(stage?: ProjectStage, patterns?: Knitpaint[], assembly?: Knitpaint) {
    if (stage) {
      this.stage = stage;
    }
    if (patterns) {
      this.patterns = patterns;
    }
    if (assembly) {
      this.assembly = assembly;
    } else {
      const width = 100;
      const height = 100;
      const data = new Uint8Array(width * height);
      this.assembly = new Knitpaint(data.buffer, width);
    }
  }

  setStage(stage: ProjectStage) {
    return new Project(stage, this.patterns, this.assembly);
  }

  setPatterns(patterns: Knitpaint[]) {
    return new Project(this.stage, patterns, this.assembly);
  }

  setAssembly(assembly: Knitpaint) {
    return new Project(this.stage, this.patterns, assembly);
  }
}
