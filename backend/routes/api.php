<?php

use App\Http\Controllers\CronogramaController;
use Illuminate\Support\Facades\Route;

Route::get('/days', [CronogramaController::class, 'index']);
Route::put('/days', [CronogramaController::class, 'update']);
Route::post('/reset', [CronogramaController::class, 'reset']);

Route::post('/days/{day}/tasks', [CronogramaController::class, 'storeTask']);
Route::patch('/tasks/{task}', [CronogramaController::class, 'updateTask']);
Route::delete('/tasks/{task}', [CronogramaController::class, 'destroyTask']);
