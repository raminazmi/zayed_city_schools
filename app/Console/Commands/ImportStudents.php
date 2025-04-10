<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Imports\StudentsImport;
use Maatwebsite\Excel\Facades\Excel;

class ImportStudents extends Command
{
    protected $signature = 'import:students {file}';
    protected $description = 'Import students from Excel file';

    public function handle()
    {
        $file = $this->argument('file');

        if (!file_exists($file)) {
            $this->error("الملف غير موجود: $file");
            return;
        }


        Excel::import(new StudentsImport, $file);
        $this->info("تم استيراد البيانات بنجاح!");
    }
}
