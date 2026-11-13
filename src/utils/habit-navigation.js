export function getHabitNavigation(habits, activeHabit) {
  const category = activeHabit?.category || 'consistency'
  const categoryHabits = habits.filter(
    (habit) => (habit.category || 'consistency') === category,
  )
  const index = categoryHabits.findIndex((habit) => habit.id === activeHabit?.id)

  return {
    previous: index > 0 ? categoryHabits[index - 1] : null,
    next: index >= 0 && index < categoryHabits.length - 1
      ? categoryHabits[index + 1]
      : null,
  }
}
