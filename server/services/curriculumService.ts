/**
 * BharatLearn AI — Curriculum & Content Service
 * Sourced from BSE Odisha Board Class 9–10 Science curricula and multi-cohort subjects.
 */

import type { ChapterBundleData } from '../types';

export class CurriculumService {
  static getChapters() {
    return [
      {
        id: 'ch_bse_od_10_bio_01_nutrition',
        subjectId: 'BSE_OD_10_LIFE_SCIENCE',
        sequenceNumber: 1,
        titleNative: 'ପୋଷଣ ଓ ଆଲୋକ ସଂଶ୍ଳେଷଣ',
        titleEn: 'Nutrition & Photosynthesis',
        gradeLevel: 10,
        conceptsCount: 4,
        isDownloadedOffline: true,
        summaryNative: 'ସବୁଜ ଉଦ୍ଭିଦରେ ଆଲୋକ ସଂଶ୍ଳେଷଣ ପ୍ରକ୍ରିୟା, ହରିତକଣା, ଆଲୋକ ଓ ଅନ୍ଧକାର ପ୍ରକ୍ରିୟାର ପର୍ଯ୍ୟାୟ।',
      },
      {
        id: 'ch_bse_od_10_phy_01_chemical_reactions',
        subjectId: 'BSE_OD_10_PHYSICAL_SCIENCE',
        sequenceNumber: 2,
        titleNative: 'ରାସାୟନିକ ପ୍ରତିକ୍ରିୟା ଓ ସମୀକରଣ',
        titleEn: 'Chemical Reactions and Equations',
        gradeLevel: 10,
        conceptsCount: 5,
        isDownloadedOffline: false,
        summaryNative: 'ରାସାୟନିକ ପ୍ରତିକ୍ରିୟାର ପ୍ରକାରଭେଦ, ସମତୁଲ ସମୀକରଣ ଏବଂ ଦୈନନ୍ଦିନ ଜୀବନରେ ଏହାର ପ୍ରଭାବ।',
      },
      {
        id: 'ch_bse_od_10_bio_02_respiration',
        subjectId: 'BSE_OD_10_LIFE_SCIENCE',
        sequenceNumber: 3,
        titleNative: 'ଶ୍ଵାସକ୍ରିୟା',
        titleEn: 'Respiration',
        gradeLevel: 10,
        conceptsCount: 3,
        isDownloadedOffline: false,
        summaryNative: 'ବାୟୁ-ଉପଜୀବୀ ଓ ବାୟୁ-ଅପଜୀବୀ ଶ୍ଵାସକ୍ରିୟା, ଗ୍ଲାଇକୋଲିସିସ୍ ଏବଂ ଶକ୍ତି ମୋଚନ।',
      },
    ];
  }

  static getSubjectsByCategory(category = 'SECONDARY') {
    if (category === 'PRIMARY') {
      return [
        {
          id: 'sub_prim_01_math',
          categoryId: 'PRIMARY',
          titleNative: 'ସରଳ ଗଣିତ (Primary Mathematics)',
          titleEnglish: 'Foundational Numeracy',
          curriculumCode: 'BSE_ODISHA',
          totalChapters: 4,
          completedChapters: 1,
          masteryPercentage: 80,
          isDownloadedOffline: true,
          chapters: [
            {
              id: 'ch_prim_01_numbers',
              subjectId: 'sub_prim_01_math',
              sequenceNumber: 1,
              titleNative: 'ସଂଖ୍ୟା ଖେଳ ଓ ଗଣନା (Numbers 1–100)',
              titleEn: 'Numbers & Counting Fun',
              gradeLevel: 3,
              conceptsCount: 3,
              isDownloadedOffline: true,
              summaryNative: 'ଛବି ଦେଖି ସଂଖ୍ୟା ଗଣିବା, ମିଶାଣ ଓ ଫେଡ଼ାଣ ଖେଳ।',
            },
          ],
        },
      ];
    }

    if (category === 'COMPETITIVE_EXAMS') {
      return [
        {
          id: 'sub_comp_neet_bio',
          categoryId: 'COMPETITIVE_EXAMS',
          titleNative: 'NEET ଜୀବ ବିଜ୍ଞାନ (High-Yield Biology)',
          titleEnglish: 'NEET UG High-Yield Biology Drill',
          curriculumCode: 'NTA_NEET',
          totalChapters: 12,
          completedChapters: 4,
          masteryPercentage: 72,
          isDownloadedOffline: true,
          chapters: [
            {
              id: 'ch_comp_genetics',
              subjectId: 'sub_comp_neet_bio',
              sequenceNumber: 1,
              titleNative: 'ବଂଶାନୁଗତିର ଆଣବିକ ଆଧାର (Molecular Genetics)',
              titleEn: 'Molecular Basis of Inheritance',
              gradeLevel: 12,
              conceptsCount: 6,
              isDownloadedOffline: true,
              summaryNative: 'DNA ପ୍ରତିକୃତି, ଟ୍ରାନ୍ସକ୍ରିପ୍ସନ୍ ଏବଂ ଜେନେଟିକ୍ କୋଡ୍ ସ୍ପୀଡ୍ ଡ୍ରିଲ୍।',
            },
          ],
        },
      ];
    }

    // Default: SECONDARY (Classes 9–10 Pilot)
    return [
      {
        id: 'sub_bse_10_bio',
        categoryId: 'SECONDARY',
        titleNative: 'ଜୀବ ବିଜ୍ଞାନ (Life Science)',
        titleEnglish: 'Life Science (BSE Odisha)',
        curriculumCode: 'BSE_ODISHA',
        totalChapters: 6,
        completedChapters: 2,
        masteryPercentage: 68,
        isDownloadedOffline: true,
        chapters: this.getChapters(),
      },
      {
        id: 'sub_bse_10_phy',
        categoryId: 'SECONDARY',
        titleNative: 'ଭୌତିକ ବିଜ୍ଞାନ (Physical Science)',
        titleEnglish: 'Physical Science (BSE Odisha)',
        curriculumCode: 'BSE_ODISHA',
        totalChapters: 7,
        completedChapters: 1,
        masteryPercentage: 42,
        isDownloadedOffline: false,
        chapters: [
          {
            id: 'ch_bse_od_10_phy_01_chemical_reactions',
            subjectId: 'sub_bse_10_phy',
            sequenceNumber: 1,
            titleNative: 'ରାସାୟନିକ ପ୍ରତିକ୍ରିୟା ଓ ସମୀକରଣ',
            titleEn: 'Chemical Reactions and Equations',
            gradeLevel: 10,
            conceptsCount: 5,
            isDownloadedOffline: false,
            summaryNative: 'ରାସାୟନିକ ପ୍ରତିକ୍ରିୟାର ପ୍ରକାରଭେଦ, ସମତୁଲ ସମୀକରଣ ଏବଂ ଦୈନନ୍ଦିନ ପ୍ରଭାବ।',
          },
        ],
      },
    ];
  }

  static getChapterBundle(chapterId: string): ChapterBundleData | null {
    if (chapterId === 'ch_bse_od_10_bio_01_nutrition') {
      return {
        packageId: 'pkg_ch_bse_od_10_bio_01_nutrition_v1',
        chapterId,
        titleNative: 'ପୋଷଣ ଓ ଆଲୋକ ସଂଶ୍ଳେଷଣ',
        language: 'or',
        version: 1,
        concepts: [
          {
            id: 'concept_photosynthesis_intro',
            titleNative: 'ଆଲୋକ ସଂଶ୍ଳେଷଣ ପରିଚୟ',
            content: 'ସବୁଜ ଉଦ୍ଭିଦ ସୂର୍ଯ୍ୟାଲୋକ, ଜଳ ଓ ଅଙ୍ଗାରକାମ୍ଳ ବ୍ୟବହାର କରି ଗ୍ଲୁକୋଜ ଉତ୍ପାଦନ କରେ।',
            citation: 'BSE Odisha Class 10 ଜୀବ ବିଜ୍ଞାନ ପୃଷ୍ଠା ୪୦',
            glossary: [
              { termEn: 'Photosynthesis', termNative: 'ଆଲୋକ ସଂଶ୍ଳେଷଣ', definition: 'ଖାଦ୍ୟ ପ୍ରସ୍ତୁତି ପ୍ରକ୍ରିୟା' },
              { termEn: 'Chlorophyll', termNative: 'ହରିତକଣା', definition: 'ସବୁଜ ରଙ୍ଗକଣିକା' },
            ],
            questions: [
              {
                questionId: 'q_intro_01',
                promptNative: 'ଆଲୋକ ସଂଶ୍ଳେଷଣ ପାଇଁ କେଉଁଟି ଅପରିହାର୍ଯ୍ୟ ନୁହେଁ?',
                options: ['ସୂର୍ଯ୍ୟାଲୋକ', 'ଅମ୍ଳଜାନ (O2)', 'ଜଳ (H2O)', 'କାର୍ବନ ଡାଇଅକ୍ସାଇଡ (CO2)'],
                correctIndex: 1,
                explanation: 'ଅମ୍ଳଜାନ ଏହି ପ୍ରକ୍ରିୟାରେ ଉତ୍ପନ୍ନ ହୁଏ, ଆବଶ୍ୟକ ହୁଏ ନାହିଁ।',
              },
            ],
          },
          {
            id: 'concept_light_reaction',
            titleNative: 'ଆଲୋକ ପ୍ରକ୍ରିୟା ଓ ଫୋଟୋଲାଇସିସ୍',
            content: 'ଗ୍ରାନାରେ ସଂଘଠିତ ହୋଇ ଜଳ ଅଣୁ ଭାଙ୍ଗି ଅମ୍ଳଜାନ ନିର୍ଗତ ହୁଏ।',
            citation: 'BSE Odisha Class 10 ଜୀବ ବିଜ୍ଞାନ ପୃଷ୍ଠା ୪୨',
            glossary: [
              { termEn: 'Photolysis', termNative: 'ଆଲୋକ ବିଶ୍ଳେଷଣ', definition: 'ଆଲୋକ ଶକ୍ତିରେ ଜଳର ବିଘଟନ' },
            ],
            questions: [
              {
                questionId: 'q_light_01',
                promptNative: 'ଆଲୋକ ସଂଶ୍ଳେଷଣରେ ନିର୍ଗତ ଅମ୍ଳଜାନର ମୁଖ୍ୟ ଉତ୍ସ କ’ଣ?',
                options: ['କାର୍ବନ ଡାଇଅକ୍ସାଇଡ', 'ଜଳ', 'ଗ୍ଲୁକୋଜ', 'କ୍ଲୋରୋଫିଲ'],
                correctIndex: 1,
                explanation: 'ନିର୍ଗତ ଅମ୍ଳଜାନ ଜଳରୁ ଆସିଥାଏ।',
                misconceptionTag: 'MISCONCEPTION_CO2_OXYGEN_SPLIT',
              },
            ],
          },
        ],
      };
    }

    return null;
  }
}
