<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Task extends Model
{
    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'id', 'day_id', 'name', 'benef', 'tipo', 'resp', 'bc', 'done', 'buffer', 'position',
    ];

    protected $casts = [
        'done' => 'boolean',
        'buffer' => 'boolean',
    ];

    public function day(): BelongsTo
    {
        return $this->belongsTo(Day::class);
    }
}
