import { CodeComparison } from "./code-comparison"

const beforeCode = `class HackathonRules:
    def __init__(self):
        self.rules = []
    
    def add_rule(self, description: str):
        self.rules.append(description)

def get_mih_rules():
    mih = HackathonRules()
    
    # 1. General Conduct
    mih.add_rule("Participants must adhere to the schedule, guidelines, and instructions communicated by the organizing committee.")
    mih.add_rule("Professional and respectful conduct towards other participants, mentors, judges, organizers, and guests is required. Any misconduct leads to disqualification.")
    mih.add_rule("Do not interfere with, copy, damage, or intentionally disrupt the work of other participants.")
    
    # 2. Team & Project Guidelines
    mih.add_rule("Each participant may be part of only one team. Changes require approval.")
    mih.add_rule("Teams must select and develop a solution within one of the specified hackathon problem domains.")
    mih.add_rule("All submitted ideas and projects must be original. Plagiarism leads to disqualification.")
    mih.add_rule("Open-source libraries, APIs, datasets, and AI tools are allowed if licenses are properly acknowledged.")
    
    # 3. Evaluation & Submission
    mih.add_rule("Shortlisted teams must participate in all mandatory stages (idea screening, progress reviews, Grand Finale).")
    mih.add_rule("Teams must submit project materials (presentation, prototype) within specified deadlines.")
    mih.add_rule("During presentations, clearly explain the problem statement, solution, and technical implementation.")
    mih.add_rule("Projects are evaluated based on committee criteria. Judges' decisions are final.")
    
    return mih.rules

if __name__ == "__main__":
    rules = get_mih_rules()
    print("=== ZEPHYR HACKATHON RULES ===")
    for idx, rule in enumerate(rules, 1):
        print(f"{idx}. {rule}")`

const afterCode = `=== ZEPHYR HACKATHON RULES ===

1. Participants must adhere to the schedule, guidelines, and instructions communicated by the organizing committee.

2. Professional and respectful conduct towards other participants, mentors, judges, organizers, and guests is required. Any misconduct leads to disqualification.

3. Do not interfere with, copy, damage, or intentionally disrupt the work of other participants.

4. Each participant may be part of only one team. Changes require approval.

5. Teams must select and develop a solution within one of the specified hackathon problem domains.

6. All submitted ideas and projects must be original. Plagiarism leads to disqualification.

7. Open-source libraries, APIs, datasets, and AI tools are allowed if licenses are properly acknowledged.

8. Shortlisted teams must participate in all mandatory stages (idea screening, progress reviews, Grand Finale).

9. Teams must submit project materials (presentation, prototype) within specified deadlines.

10. During presentations, clearly explain the problem statement, solution, and technical implementation.

11. Projects are evaluated based on committee criteria. Judges' decisions are final.`

export default function RulesSection() {
  return (
    <section id="rules" className="section section--dark" style={{ position: 'relative', overflow: 'hidden' }}>
      
      {/* Background Effect */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
        backgroundSize: '56px 56px',
        maskImage: 'linear-gradient(to bottom, black 20%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 20%, transparent 100%)',
      }} />

      <div style={{ textAlign: 'center', marginBottom: 64, position: 'relative', zIndex: 1 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.15em', color: 'var(--color-accent)', textTransform: 'uppercase' }}>THE GUIDELINES</span>
        <h2 className="display-heading display-md" style={{ color: '#fff', marginTop: 12 }}>
          Rules & <span className="text-highlight">Regulations</span>
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, marginTop: 16, maxWidth: 600, marginInline: 'auto' }}>
          Please read the following guidelines carefully to ensure a fair and smooth experience for everyone participating in Zephyr.
        </p>
      </div>

      <CodeComparison
        beforeCode={beforeCode}
        afterCode={afterCode}
        language="python"
        filename="rules.py"
        lightTheme="github-dark"
        darkTheme="github-dark"
      />
      
    </section>
  )
}
