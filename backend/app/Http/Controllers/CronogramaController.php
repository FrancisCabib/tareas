<?php

namespace App\Http\Controllers;

use App\Models\Day;
use App\Models\Task;
use App\Support\DefaultCronograma;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CronogramaController extends Controller
{
    /** GET /api/days — current schedule. Seeds defaults on first run. */
    public function index(): JsonResponse
    {
        if (Day::count() === 0) {
            $this->persist(DefaultCronograma::days());
        }

        return response()->json($this->load());
    }

    /** PUT /api/days — replace the whole schedule with the posted state. */
    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'days' => ['required', 'array'],
            'days.*.id' => ['required', 'string'],
            'days.*.label' => ['required', 'string'],
            'days.*.focus' => ['present', 'string'],
            'days.*.tasks' => ['present', 'array'],
            'days.*.tasks.*.id' => ['required', 'string'],
            'days.*.tasks.*.name' => ['required', 'string'],
            'days.*.tasks.*.benef' => ['nullable', 'string'],
            'days.*.tasks.*.tipo' => ['nullable', 'string'],
            'days.*.tasks.*.resp' => ['nullable', 'string'],
            'days.*.tasks.*.bc' => ['nullable', 'string'],
            'days.*.tasks.*.done' => ['boolean'],
            'days.*.tasks.*.buffer' => ['boolean'],
        ]);

        $this->persist($data['days']);

        return response()->json($this->load());
    }

    /** POST /api/reset — restore the default schedule. */
    public function reset(): JsonResponse
    {
        $this->persist(DefaultCronograma::days());

        return response()->json($this->load());
    }

    /** POST /api/days/{day}/tasks — create a task at the end of a day. */
    public function storeTask(Request $request, Day $day): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string'],
            'benef' => ['nullable', 'string'],
            'tipo' => ['nullable', 'string'],
            'resp' => ['nullable', 'string'],
            'bc' => ['nullable', 'string'],
        ]);

        Task::create([
            'id' => (string) Str::uuid(),
            'day_id' => $day->id,
            'name' => $data['name'],
            'benef' => $data['benef'] ?? '',
            'tipo' => $data['tipo'] ?? '',
            'resp' => $data['resp'] ?? '',
            'bc' => $data['bc'] ?? 'b-info',
            'done' => false,
            'buffer' => false,
            'position' => ($day->tasks()->max('position') ?? -1) + 1,
        ]);

        return response()->json($this->load(), 201);
    }

    /** PATCH /api/tasks/{task} — update some fields of a task. */
    public function updateTask(Request $request, Task $task): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string'],
            'benef' => ['sometimes', 'nullable', 'string'],
            'tipo' => ['sometimes', 'nullable', 'string'],
            'resp' => ['sometimes', 'nullable', 'string'],
            'bc' => ['sometimes', 'nullable', 'string'],
            'done' => ['sometimes', 'boolean'],
        ]);

        foreach (['benef', 'tipo', 'resp', 'bc'] as $key) {
            if (array_key_exists($key, $data) && $data[$key] === null) {
                $data[$key] = '';
            }
        }

        $task->fill($data)->save();

        return response()->json($this->load());
    }

    /** DELETE /api/tasks/{task} — remove a task. */
    public function destroyTask(Task $task): JsonResponse
    {
        $task->delete();

        return response()->json($this->load());
    }

    /**
     * Read the schedule in the shape the frontend expects.
     *
     * @return array<int, array<string, mixed>>
     */
    private function load(): array
    {
        return Day::with('tasks')->orderBy('position')->get()
            ->map(fn (Day $day) => [
                'id' => $day->id,
                'label' => $day->label,
                'focus' => $day->focus,
                'tasks' => $day->tasks->map(fn (Task $t) => [
                    'id' => $t->id,
                    'name' => $t->name,
                    'benef' => $t->benef,
                    'tipo' => $t->tipo,
                    'resp' => $t->resp,
                    'bc' => $t->bc,
                    'done' => $t->done,
                    'buffer' => $t->buffer,
                ])->all(),
            ])->all();
    }

    /**
     * Replace all days/tasks with the given structure, keeping array order as position.
     *
     * @param  array<int, array<string, mixed>>  $days
     */
    private function persist(array $days): void
    {
        DB::transaction(function () use ($days) {
            Task::query()->delete();
            Day::query()->delete();

            foreach ($days as $di => $day) {
                Day::create([
                    'id' => $day['id'],
                    'label' => $day['label'],
                    'focus' => $day['focus'] ?? '',
                    'position' => $di,
                ]);

                foreach ($day['tasks'] ?? [] as $ti => $task) {
                    Task::create([
                        'id' => $task['id'],
                        'day_id' => $day['id'],
                        'name' => $task['name'],
                        'benef' => $task['benef'] ?? '',
                        'tipo' => $task['tipo'] ?? '',
                        'resp' => $task['resp'] ?? '',
                        'bc' => $task['bc'] ?? 'b-info',
                        'done' => (bool) ($task['done'] ?? false),
                        'buffer' => (bool) ($task['buffer'] ?? false),
                        'position' => $ti,
                    ]);
                }
            }
        });
    }
}
