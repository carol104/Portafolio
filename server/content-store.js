import {initialContent} from '../src/content.js';
import {migrateTechnologyLogos} from './content-migrations.js';
import {migrateProfileLinks} from './profile-migrations.js';
import {migrateQualityTools} from './quality-migration.js';
import {migrateExpandedStack} from './stack-migration.js';
import {migratePortfolioStructure} from './experience-migration.js';
import {migrateDataBi} from './bi-migration.js';
import {migrateCourseCleanup} from './course-clean-migration.js';
import {migrateCoursePlatforms} from './platform-migration.js';
import {normalizeContent} from './content-model.js';
import {migrateCourseImages} from './course-images-migration.js';
import {migrateServices} from './services-migration.js';
import {migrateInterests} from './interests-migration.js';
import {migrateAptitudes} from './aptitudes-migration.js';
import {migrateHomepageCopy} from './homepage-copy-migration.js';
import {migrateSummaryCopy} from './summary-copy-migration.js';
import {migrateProjectDetails} from './project-details-migration.js';
import {migrateTeamProjectDetails} from './team-project-details-migration.js';
import {migrateKarenProjectDetails} from './karen-project-details-migration.js';
export function createContentStore(pool,{courseImagesPath}={}){return {
 async initialize(){await pool.query('INSERT INTO site_content (id, data) VALUES (1, $1::jsonb) ON CONFLICT (id) DO NOTHING',[JSON.stringify(initialContent)]);await migrateTechnologyLogos(pool);await migrateProfileLinks(pool);await migrateQualityTools(pool);await migrateExpandedStack(pool);await migratePortfolioStructure(pool);await migrateDataBi(pool);await migrateCourseCleanup(pool);await migrateCoursePlatforms(pool);await migrateCourseImages(pool,{directory:courseImagesPath});await migrateInterests(pool);await migrateServices(pool);await migrateAptitudes(pool);await migrateHomepageCopy(pool);await migrateSummaryCopy(pool);await migrateProjectDetails(pool);await migrateTeamProjectDetails(pool);await migrateKarenProjectDetails(pool)},
 async read(){const {rows}=await pool.query('SELECT data, revision, updated_at FROM site_content WHERE id = 1');if(!rows[0])throw new Error('Content not initialized');return {...rows[0], data:normalizeContent(rows[0].data)}},
 async save(data,revision){const {rows}=await pool.query('UPDATE site_content SET data=$1::jsonb, revision=revision+1, updated_at=NOW() WHERE id=1 AND revision=$2 RETURNING data, revision, updated_at',[JSON.stringify(data),revision]);return rows[0]},
}}
