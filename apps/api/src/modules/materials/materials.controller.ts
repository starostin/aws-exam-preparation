import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { MaterialsQueryDto } from './dto/materials-query.dto';
import { MaterialsService, StudyMaterialItem } from './materials.service';

@Controller({ path: ['materials', 'topics/materials'], version: '1' })
@UseGuards(AuthGuard)
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Get()
  async listMaterials(@Query() query: MaterialsQueryDto): Promise<StudyMaterialItem[]> {
    return this.materialsService.listStudyMaterials(query);
  }
}
