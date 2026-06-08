<?php

namespace App\Support;

class DefaultCronograma
{
    /**
     * Default weekly schedule. Same shape the frontend consumes:
     * [ { id, label, focus, tasks: [ { id, name, benef, tipo, resp, bc, done, buffer? } ] } ]
     *
     * @return array<int, array<string, mixed>>
     */
    public static function days(): array
    {
        return [
            ['id' => 'd0', 'label' => 'Lunes 8 junio', 'focus' => 'Solicitudes + dominios', 'tasks' => [
                ['id' => 't0', 'name' => 'Solicitar fotos', 'benef' => 'Eventos BFA', 'tipo' => 'Fotos', 'resp' => 'Francis → Beneficiario', 'bc' => 'b-fotos', 'done' => false],
                ['id' => 't1', 'name' => 'Pedir las fotos en el Drive', 'benef' => 'Eventos Nantoco', 'tipo' => 'Fotos', 'resp' => 'Francis → Beneficiario', 'bc' => 'b-fotos', 'done' => false],
                ['id' => 't2', 'name' => 'Solicitar las fotos', 'benef' => 'Paola Torrealba', 'tipo' => 'Fotos', 'resp' => 'Francis → Beneficiario', 'bc' => 'b-fotos', 'done' => false],
                ['id' => 't3', 'name' => 'Mandar la info faltante', 'benef' => 'LC Obras Civiles', 'tipo' => 'Info', 'resp' => 'Francis → Beneficiario', 'bc' => 'b-info', 'done' => false],
                ['id' => 't4', 'name' => 'Comprar dominio', 'benef' => 'Dayna', 'tipo' => 'Dominio/Hosting', 'resp' => 'Francis', 'bc' => 'b-dominio', 'done' => false],
                ['id' => 't5', 'name' => 'Comprar dominio', 'benef' => 'Eventos BFA', 'tipo' => 'Dominio/Hosting', 'resp' => 'Francis', 'bc' => 'b-dominio', 'done' => false],
            ]],
            ['id' => 'd1', 'label' => 'Martes 9 junio', 'focus' => 'Hosting + fotos propias', 'tasks' => [
                ['id' => 't6', 'name' => 'Comprar hosting y dominio', 'benef' => 'Neomarc', 'tipo' => 'Dominio/Hosting', 'resp' => 'Francis', 'bc' => 'b-dominio', 'done' => false],
                ['id' => 't7', 'name' => 'Buscar las fotos de los neumáticos', 'benef' => 'Neomarc', 'tipo' => 'Fotos', 'resp' => 'Francis', 'bc' => 'b-fotos', 'done' => false],
                ['id' => 't8', 'name' => 'Subir las fotos', 'benef' => 'Mi Jardín', 'tipo' => 'Fotos', 'resp' => 'Francis', 'bc' => 'b-fotos', 'done' => false],
                ['id' => 't9', 'name' => 'Publicar fotos', 'benef' => 'Dayna', 'tipo' => 'Fotos', 'resp' => 'Francis', 'bc' => 'b-fotos', 'done' => false],
            ]],
            ['id' => 'd2', 'label' => 'Miércoles 10 junio', 'focus' => 'Desarrollo ligero', 'tasks' => [
                ['id' => 't10', 'name' => 'Conectar Git al cPanel', 'benef' => 'Mi Jardín', 'tipo' => 'Desarrollo', 'resp' => 'Francis', 'bc' => 'b-desarrollo', 'done' => false],
                ['id' => 't11', 'name' => 'Levantar la web nueva', 'benef' => 'LC Obras Civiles', 'tipo' => 'Desarrollo', 'resp' => 'Francis', 'bc' => 'b-desarrollo', 'done' => false],
                ['id' => 't12', 'name' => 'Crear sistema de cotización', 'benef' => 'Paola Torrealba', 'tipo' => 'Desarrollo', 'resp' => 'Francis (inicio)', 'bc' => 'b-desarrollo', 'done' => false],
            ]],
            ['id' => 'd3', 'label' => 'Jueves 11 junio', 'focus' => 'Desarrollo pesado + onboarding', 'tasks' => [
                ['id' => 't13', 'name' => 'Terminar el SaaS', 'benef' => 'Neomarc', 'tipo' => 'Desarrollo', 'resp' => 'Francis', 'bc' => 'b-desarrollo', 'done' => false],
                ['id' => 't14', 'name' => 'Crear onboarding cotizador/catálogo', 'benef' => 'Dayna', 'tipo' => 'Onboarding', 'resp' => 'Francis', 'bc' => 'b-onboarding', 'done' => false],
                ['id' => 't15', 'name' => 'Instalar onboarding', 'benef' => 'Paola Torrealba', 'tipo' => 'Onboarding', 'resp' => 'Francis', 'bc' => 'b-onboarding', 'done' => false],
            ]],
            ['id' => 'd4', 'label' => 'Viernes 12 junio', 'focus' => 'Cierre + documentación', 'tasks' => [
                ['id' => 't16', 'name' => 'Hacer documento de entrega formal', 'benef' => 'Mi Jardín', 'tipo' => 'Documentación', 'resp' => 'Francis', 'bc' => 'b-doc', 'done' => false],
                ['id' => 't17', 'name' => 'Buffer: tareas atrasadas', 'benef' => '—', 'tipo' => '—', 'resp' => '—', 'bc' => 'b-info', 'done' => false, 'buffer' => true],
            ]],
        ];
    }
}
