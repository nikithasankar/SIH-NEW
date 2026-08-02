import { useNavigate } from 'react-router-dom';
import { exerciseCatalog } from '../data/exerciseCatalog';
import { ExerciseCard } from '../components/ExerciseCard';

export function ExercisePicker() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 px-4 pt-6 pb-20">
      <h1 className="text-2xl font-bold mb-6">Choose Exercise</h1>
      <div className="grid grid-cols-2 gap-4">
        {exerciseCatalog.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            onClick={() => navigate(`/app/assess/${exercise.id}`)}
          />
        ))}
      </div>
    </div>
  );
}
