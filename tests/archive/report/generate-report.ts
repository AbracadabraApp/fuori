// Report generator for simulated learner test results
// Based on docs/10-testing.md section 4b
// Generates markdown reports showing test quality across criteria, characters, and personas

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { execSync } from 'child_process';

// Test result types based on the 8 criteria from section 4b
export interface TestRun {
  id: string;
  timestamp: Date;
  personaId: string;
  personaName: string;
  characterId: string;
  characterName: string;
  sceneId: string;
  sceneName: string;

  transcript: Array<{
    who: 'learner' | 'npc';
    text: string;
  }>;

  // The 8 evaluation criteria
  scores: {
    stayedWithinLevel: Score;           // Length, tenses, vocabulary within A1-A2
    recastMistakes: Score;              // Real mistakes recast, noise ignored
    stayedInItalian: Score;             // Never switched to English unprompted
    maintainedFormality: Score;         // tu/Lei as character sheet says
    goalsTrackedCorrectly: Score;       // Steps ticked only when done
    confusedUsedSparingly: Score;       // confused flag used appropriately
    hintsUsedSparingly: Score;          // hints offered when needed, not excessively
    stayedInCharacter: Score;           // Personality, pace, regionalisms consistent
  };
}

export interface Score {
  pass: boolean;
  value?: number;                       // 0-10 if scored, undefined if pass/fail only
  evidence: string;                     // What went right or wrong
  snippet?: string;                     // Relevant conversation excerpt
}

export interface ReportSummary {
  totalConversations: number;
  passRatePerCriterion: Record<string, number>;
  personas: Set<string>;
  scenes: Set<string>;
  characters: Set<string>;
}

export interface ReportGenerator {
  generate(results: TestRun[]): string;
  save(results: TestRun[]): Promise<string>;
}

// Main report generator implementation
class ReportGeneratorImpl implements ReportGenerator {

  /**
   * Generate complete markdown report from test results
   */
  generate(results: TestRun[]): string {
    if (results.length === 0) {
      return '# Test Report\n\nNo test results provided.\n';
    }

    const summary = this.computeSummary(results);
    const criteriaBreakdown = this.generateCriteriaBreakdown(results);
    const worstExamples = this.generateWorstExamples(results);
    const characterAnalysis = this.generateCharacterAnalysis(results);
    const personaAnalysis = this.generatePersonaAnalysis(results);

    const sections = [
      this.generateHeader(results[0].timestamp),
      this.generateSummary(summary),
      criteriaBreakdown,
      worstExamples,
      characterAnalysis,
      personaAnalysis,
      this.generateFooter(),
    ];

    return sections.join('\n\n---\n\n');
  }

  /**
   * Generate report and save to tests/reports/YYYY-MM-DD-HHmm.md
   */
  async save(results: TestRun[]): Promise<string> {
    const reportContent = this.generate(results);
    const timestamp = results[0]?.timestamp || new Date();
    const filename = this.formatFilename(timestamp);

    const reportDir = join(process.cwd(), 'tests', 'reports');
    await mkdir(reportDir, { recursive: true });

    const filepath = join(reportDir, filename);
    await writeFile(filepath, reportContent, 'utf-8');

    return filepath;
  }

  // Private helper methods

  private formatFilename(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}-${hours}${minutes}.md`;
  }

  private getGitCommitHash(): string {
    try {
      return execSync('git rev-parse --short HEAD', {
        encoding: 'utf-8',
        cwd: process.cwd()
      }).trim();
    } catch {
      return 'unknown';
    }
  }

  private generateHeader(timestamp: Date): string {
    const dateStr = timestamp.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    const commitHash = this.getGitCommitHash();

    return `# Simulated Learner Test Report

**Generated:** ${dateStr}
**Git Commit:** \`${commitHash}\`

This report evaluates conversation quality against the 8 criteria defined in [docs/10-testing.md](../../docs/10-testing.md#4b-simulated-learner).`;
  }

  private computeSummary(results: TestRun[]): ReportSummary {
    const criteriaKeys = [
      'stayedWithinLevel',
      'recastMistakes',
      'stayedInItalian',
      'maintainedFormality',
      'goalsTrackedCorrectly',
      'confusedUsedSparingly',
      'hintsUsedSparingly',
      'stayedInCharacter'
    ] as const;

    const passRatePerCriterion: Record<string, number> = {};

    for (const criterion of criteriaKeys) {
      const passed = results.filter(r => r.scores[criterion].pass).length;
      passRatePerCriterion[criterion] = (passed / results.length) * 100;
    }

    return {
      totalConversations: results.length,
      passRatePerCriterion,
      personas: new Set(results.map(r => r.personaName)),
      scenes: new Set(results.map(r => r.sceneName)),
      characters: new Set(results.map(r => r.characterName)),
    };
  }

  private generateSummary(summary: ReportSummary): string {
    const personasList = Array.from(summary.personas).join(', ');
    const scenesList = Array.from(summary.scenes).join(', ');
    const charactersList = Array.from(summary.characters).join(', ');

    return `## Summary

- **Total conversations tested:** ${summary.totalConversations}
- **Personas tested:** ${personasList}
- **Scenes tested:** ${scenesList}
- **Characters tested:** ${charactersList}

### Overall Pass Rates

${this.formatPassRatesTable(summary.passRatePerCriterion)}`;
  }

  private formatPassRatesTable(passRates: Record<string, number>): string {
    const criteriaLabels: Record<string, string> = {
      stayedWithinLevel: 'Stayed within A1-A2 level',
      recastMistakes: 'Recast mistakes, ignored noise',
      stayedInItalian: 'Stayed in Italian',
      maintainedFormality: 'Maintained correct formality (tu/Lei)',
      goalsTrackedCorrectly: 'Goals tracked correctly',
      confusedUsedSparingly: 'Confused flag used sparingly',
      hintsUsedSparingly: 'Hints used sparingly',
      stayedInCharacter: 'Stayed in character',
    };

    let table = '| Criterion | Pass Rate |\n|-----------|----------|\n';

    for (const [key, rate] of Object.entries(passRates)) {
      const label = criteriaLabels[key] || key;
      const rateStr = `${rate.toFixed(1)}%`;
      const emoji = rate >= 90 ? '✅' : rate >= 70 ? '⚠️' : '❌';
      table += `| ${label} | ${rateStr} ${emoji} |\n`;
    }

    return table;
  }

  private generateCriteriaBreakdown(results: TestRun[]): string {
    const criteria = [
      { key: 'stayedWithinLevel', label: 'Stayed Within Level' },
      { key: 'recastMistakes', label: 'Recast Mistakes' },
      { key: 'stayedInItalian', label: 'Stayed in Italian' },
      { key: 'maintainedFormality', label: 'Maintained Formality' },
      { key: 'goalsTrackedCorrectly', label: 'Goals Tracked Correctly' },
      { key: 'confusedUsedSparingly', label: 'Confused Used Sparingly' },
      { key: 'hintsUsedSparingly', label: 'Hints Used Sparingly' },
      { key: 'stayedInCharacter', label: 'Stayed in Character' },
    ] as const;

    let sections = ['## Per-Criterion Breakdown\n'];

    for (const { key, label } of criteria) {
      const criterionResults = results.map(r => r.scores[key]);
      const passCount = criterionResults.filter(s => s.pass).length;
      const passRate = ((passCount / results.length) * 100).toFixed(1);

      // Calculate average score if numeric scores available
      const scores = criterionResults
        .map(s => s.value)
        .filter((v): v is number => v !== undefined);
      const avgScore = scores.length > 0
        ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
        : 'N/A';

      sections.push(`### ${label}\n`);
      sections.push(`**Pass rate:** ${passRate}% (${passCount}/${results.length})`);

      if (avgScore !== 'N/A') {
        sections.push(`**Average score:** ${avgScore}/10`);
      }

      sections.push('');
    }

    return sections.join('\n');
  }

  private generateWorstExamples(results: TestRun[]): string {
    const criteria = [
      { key: 'stayedWithinLevel', label: 'Stayed Within Level' },
      { key: 'recastMistakes', label: 'Recast Mistakes' },
      { key: 'stayedInItalian', label: 'Stayed in Italian' },
      { key: 'maintainedFormality', label: 'Maintained Formality' },
      { key: 'goalsTrackedCorrectly', label: 'Goals Tracked Correctly' },
      { key: 'confusedUsedSparingly', label: 'Confused Used Sparingly' },
      { key: 'hintsUsedSparingly', label: 'Hints Used Sparingly' },
      { key: 'stayedInCharacter', label: 'Stayed in Character' },
    ] as const;

    let sections = ['## Worst Examples\n'];
    sections.push('For each failing criterion, the 2-3 worst examples are shown below.\n');

    for (const { key, label } of criteria) {
      const failures = results
        .map(r => ({
          run: r,
          score: r.scores[key],
        }))
        .filter(({ score }) => !score.pass)
        .sort((a, b) => {
          // Sort by score if available (lower is worse), otherwise alphabetically
          if (a.score.value !== undefined && b.score.value !== undefined) {
            return a.score.value - b.score.value;
          }
          return 0;
        })
        .slice(0, 3); // Top 3 worst

      if (failures.length === 0) {
        continue; // Skip criteria with no failures
      }

      sections.push(`### ${label}\n`);

      for (const { run, score } of failures) {
        sections.push(`**${run.characterName}** with **${run.personaName}** in *${run.sceneName}*`);

        if (score.value !== undefined) {
          sections.push(`Score: ${score.value}/10`);
        }

        sections.push(`\n${score.evidence}\n`);

        if (score.snippet) {
          sections.push('```');
          sections.push(score.snippet);
          sections.push('```\n');
        }
      }
    }

    if (sections.length === 2) {
      sections.push('*No failures recorded - all criteria passed!*');
    }

    return sections.join('\n');
  }

  private generateCharacterAnalysis(results: TestRun[]): string {
    const characterMap = new Map<string, TestRun[]>();

    for (const run of results) {
      const existing = characterMap.get(run.characterName) || [];
      existing.push(run);
      characterMap.set(run.characterName, existing);
    }

    let sections = ['## Per-Character Analysis\n'];
    sections.push('How each character performed across all criteria.\n');

    const characters = Array.from(characterMap.entries())
      .sort(([, a], [, b]) => {
        // Sort by pass rate (lower = more struggles)
        const aPassRate = this.calculateCharacterPassRate(a);
        const bPassRate = this.calculateCharacterPassRate(b);
        return aPassRate - bPassRate;
      });

    for (const [characterName, runs] of characters) {
      const passRate = this.calculateCharacterPassRate(runs);
      const totalTests = runs.length;
      const struggles = this.identifyCharacterStruggles(runs);

      sections.push(`### ${characterName}\n`);
      sections.push(`**Tests:** ${totalTests}`);
      sections.push(`**Overall pass rate:** ${passRate.toFixed(1)}%`);

      if (struggles.length > 0) {
        sections.push(`\n**Struggles with:**`);
        for (const struggle of struggles) {
          sections.push(`- ${struggle}`);
        }
      } else {
        sections.push(`\n*No significant struggles - performing well across all criteria.*`);
      }

      sections.push('');
    }

    return sections.join('\n');
  }

  private calculateCharacterPassRate(runs: TestRun[]): number {
    let totalPasses = 0;
    let totalCriteria = 0;

    for (const run of runs) {
      const scores = Object.values(run.scores);
      totalPasses += scores.filter(s => s.pass).length;
      totalCriteria += scores.length;
    }

    return totalCriteria > 0 ? (totalPasses / totalCriteria) * 100 : 0;
  }

  private identifyCharacterStruggles(runs: TestRun[]): string[] {
    const criteriaLabels: Record<string, string> = {
      stayedWithinLevel: 'Staying within A1-A2 level',
      recastMistakes: 'Recasting mistakes naturally',
      stayedInItalian: 'Staying in Italian',
      maintainedFormality: 'Maintaining correct formality',
      goalsTrackedCorrectly: 'Tracking goals correctly',
      confusedUsedSparingly: 'Using confused flag appropriately',
      hintsUsedSparingly: 'Using hints appropriately',
      stayedInCharacter: 'Staying in character',
    };

    const criteriaFailures = new Map<string, number>();

    for (const run of runs) {
      for (const [key, score] of Object.entries(run.scores)) {
        if (!score.pass) {
          criteriaFailures.set(key, (criteriaFailures.get(key) || 0) + 1);
        }
      }
    }

    // Struggles are criteria that fail >30% of the time
    const struggles: string[] = [];
    const threshold = runs.length * 0.3;

    for (const [key, failures] of Array.from(criteriaFailures.entries())) {
      if (failures > threshold) {
        const label = criteriaLabels[key] || key;
        const rate = ((failures / runs.length) * 100).toFixed(0);
        struggles.push(`${label} (${rate}% failure rate)`);
      }
    }

    return struggles;
  }

  private generatePersonaAnalysis(results: TestRun[]): string {
    const personaMap = new Map<string, TestRun[]>();

    for (const run of results) {
      const existing = personaMap.get(run.personaName) || [];
      existing.push(run);
      personaMap.set(run.personaName, existing);
    }

    let sections = ['## Per-Persona Analysis\n'];
    sections.push('Did the test correctly handle different learner types?\n');

    for (const [personaName, runs] of Array.from(personaMap.entries())) {
      const passRate = this.calculateCharacterPassRate(runs); // Same calculation works
      const totalTests = runs.length;

      sections.push(`### ${personaName}\n`);
      sections.push(`**Tests:** ${totalTests}`);
      sections.push(`**Overall pass rate:** ${passRate.toFixed(1)}%`);

      // Analyze specific persona behaviors
      const personaInsights = this.analyzePersonaBehavior(runs);
      if (personaInsights.length > 0) {
        sections.push(`\n**Observations:**`);
        for (const insight of personaInsights) {
          sections.push(`- ${insight}`);
        }
      }

      sections.push('');
    }

    return sections.join('\n');
  }

  private analyzePersonaBehavior(runs: TestRun[]): string[] {
    const insights: string[] = [];

    // Check if recast mistakes was handled well (key for personas with common errors)
    const recastScore = runs.filter(r => r.scores.recastMistakes.pass).length;
    const recastRate = (recastScore / runs.length) * 100;

    if (recastRate < 70) {
      insights.push(`Struggled with mistake recasting (${recastRate.toFixed(0)}% pass rate)`);
    } else if (recastRate >= 95) {
      insights.push(`Excellent mistake handling (${recastRate.toFixed(0)}% pass rate)`);
    }

    // Check formality handling
    const formalityScore = runs.filter(r => r.scores.maintainedFormality.pass).length;
    const formalityRate = (formalityScore / runs.length) * 100;

    if (formalityRate < 70) {
      insights.push(`Formality consistency issues (${formalityRate.toFixed(0)}% pass rate)`);
    }

    // Check if persona was appropriately challenged but not overwhelmed
    const confusedScore = runs.filter(r => r.scores.confusedUsedSparingly.pass).length;
    const confusedRate = (confusedScore / runs.length) * 100;

    if (confusedRate < 70) {
      insights.push(`Too much confusion signaled (${confusedRate.toFixed(0)}% pass rate) - may be too harsh`);
    }

    return insights;
  }

  private generateFooter(): string {
    return `## How to Use This Report

1. **Check overall pass rates** - Are any criteria below 70%? Those need prompt adjustments.
2. **Review worst examples** - Read the specific failures to understand what went wrong.
3. **Compare characters** - Which characters struggle most? Their character sheets may need refinement.
4. **Validate persona handling** - Did the system appropriately handle different learner types?

**Next steps:**
- If pass rates are low, review the relevant sections in [docs/04-conversation-engine.md](../../docs/04-conversation-engine.md)
- Update character sheets or house rules based on identified patterns
- Re-run tests after changes to measure improvement

---

*Generated by tests/report/generate-report.ts*`;
  }
}

// Export singleton instance
export const reportGenerator: ReportGenerator = new ReportGeneratorImpl();

// Export factory for testing
export function createReportGenerator(): ReportGenerator {
  return new ReportGeneratorImpl();
}
