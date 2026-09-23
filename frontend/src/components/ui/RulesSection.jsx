import { CodeComparison } from "./code-comparison"

const beforeCode = `class HackathonRules:
    def __init__(self):
        self.rules = []
    
    def add_rule(self, description: str):
        self.rules.append(description)

def get_zephyr_rules():
    z = HackathonRules()
    
    # 1. Registration & Teams
    z.add_rule("Registration fee of ₹500 will be collected only from teams who are shortlisted for Online round.")
    z.add_rule("Each participant may be part of only one team. Changes require approval.")
    z.add_rule("Inter college teams are allowed.")
    
    # 2. General Conduct
    z.add_rule("Participants must adhere to the schedule, guidelines, and instructions communicated by the organizing committee.")
    z.add_rule("Professional and respectful conduct is required. Any misconduct leads to disqualification.")
    z.add_rule("Do not interfere with, copy, damage, or intentionally disrupt the work of other participants.")
    
    # 3. Project Guidelines
    z.add_rule("Teams must select and develop a solution within one of the specified hackathon problem domains.")
    z.add_rule("All submitted ideas and projects must be original. Plagiarism leads to disqualification.")
    z.add_rule("Open-source libraries, APIs, datasets, and AI tools are allowed if licenses are properly acknowledged.")
    
    # 4. Evaluation & Submission
    z.add_rule("Shortlisted teams must participate in all mandatory stages (idea screening, progress reviews, Grand Finale).")
    z.add_rule("Teams must submit project materials (presentation, prototype) within specified deadlines.")
    z.add_rule("Only the given PPT Template should be used for Presentations.")
    z.add_rule("During presentations, clearly explain the problem statement, solution, and technical implementation.")
    z.add_rule("Projects are evaluated based on committee criteria. Judges' decisions are final.")
    
    # 5. Finale & Announcements
    z.add_rule("Winners and shortlisted teams may get development tools and internship opportunities from Microsoft.")
    z.add_rule("Important announcements will be made through mail, website, and Instagram. Visit them often.")
    z.add_rule("Finalists must carry the admit card for Finale Entry. Otherwise entry is prohibited.")
    z.add_rule("For further queries contact us through Mail and provided phone numbers.")
    
    return z.rules

if __name__ == "__main__":
    rules = get_zephyr_rules()
    print("=== ZEPHYR HACKATHON RULES ===\n")
    for idx, rule in enumerate(rules, 1):
        print(f"{idx}. {rule}\n")`

const afterCode = `=== ZEPHYR HACKATHON RULES ===

1. Registration fee of ₹500 will be collected only from teams who are shortlisted for Online round.

2. Each participant may be part of only one team. Changes require approval.

3. Inter college teams are allowed.

4. Participants must adhere to the schedule, guidelines, and instructions communicated by the organizing committee.

5. Professional and respectful conduct is required. Any misconduct leads to disqualification.

6. Do not interfere with, copy, damage, or intentionally disrupt the work of other participants.

7. Teams must select and develop a solution within one of the specified hackathon problem domains.

8. All submitted ideas and projects must be original. Plagiarism leads to disqualification.

9. Open-source libraries, APIs, datasets, and AI tools are allowed if licenses are properly acknowledged.

10. Shortlisted teams must participate in all mandatory stages (idea screening, progress reviews, Grand Finale).

11. Teams must submit project materials (presentation, prototype) within specified deadlines.

12. Only the given PPT Template should be used for Presentations.

13. During presentations, clearly explain the problem statement, solution, and technical implementation.

14. Projects are evaluated based on committee criteria. Judges' decisions are final.

15. Winners and shortlisted teams may get development tools and internship opportunities from Microsoft.

16. Important announcements will be made through mail, website, and Instagram. Visit them often.

17. Finalists must carry the admit card for Finale Entry. Otherwise entry is prohibited.

18. For further queries contact us through Mail and provided phone numbers.`

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
