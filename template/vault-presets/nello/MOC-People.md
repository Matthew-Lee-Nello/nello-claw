---
type: moc
tags: [navigation, people]
date: {{today}}
---

# MOC - People

Index of people in your world.

{{#each teamMembers}}
- [[Person-{{slug}}]] - team ({{role}})
{{/each}}
{{#each mentors}}
- [[Person-{{slug}}]] - {{relationship}}
{{/each}}
