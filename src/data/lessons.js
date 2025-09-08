export const getAllLessons = {
  lesson_1: {
    title: "Basic Greetings",
    lesson_id: "YOR-A1-1",
    base_xp: 40,
    exercises: [
      {
        type: "vocabulary",
        question: "Good morning",
        options: ["Ẹ káàsán", "Bàá wà?", "Ẹ káàárọ̀", "Ẹ kú alẹ́"],
        answer: "Ẹ káàárọ̀",
        audio_path: "asset/audio/good_morning.wav",
      },
      {
        type: "tap_what_you_hear",
        correct_answer: "Good Afternoon",
        audio_path: "asset/audio/good_afternoon.wav",
        options: ["Hello", "Good Afternoon", "Thank you", "Please"],
      },
      {
        type: "vocabulary",
        question: "Good evening",
        options: ["Ẹ káàsán", "Bàá wà?", "Ẹ káàárọ̀", "Ẹ kú alẹ́"],
        answer: "Ẹ kú alẹ́",
      },
      {
        type: "match_words",
        pairs: [
          ["Ẹ ṣé", "Thank you"],
          ["Ẹ jọ̀ọ́", "Please"],
          ["Ẹ ká bọ̀", "Welcome"],
          ["Ẹ kú iṣẹ́", "Well done"],
        ],
      },
      {
        type: "role_play_options",
        scenario: "Your neighbor says 'Ẹ káàárọ̀'",
        correct_answer: "Ẹ káàárọ̀ sir!",
        options: ["Ẹ káàárọ̀ sir!", "Ẹ ṣé", "Ẹ kú alẹ́", "Bàá wà?"],
        character_image: "asset/Characters/elder.png",
      },
      {
        type: "fill_the_gap",
        sentence_parts: ["Ẹ káàárọ̀", "__", "ẹ jọ̀ọ́"],
        gap_index: 1,
        answer: "sir",
        hint: "Respectful term for elders",
      },
      {
        type: "main_idea",
        composition:
          "Adé said 'Ẹ káàárọ̀' to his teacher. The teacher replied 'Ẹ káàárọ̀ ọmọ mi'. Adé then asked 'Báwo ni?'",
        question: "What were they doing?",
        options: [
          "Exchanging greetings",
          "Having an argument",
          "Telling a story",
        ],
        answer: "Exchanging greetings",
      },
      {
        type: "match_image_to_word",
        image: "asset/A1/grandma.png",
        options: ["Ìyá", "Bàbá", "Àràbìnrin", "Ìyá àgbà"],
        answer: "Ìyá àgbà",
      },
      {
        type: "type_what_you_hear",
        audio_path: "asset/audio/good_night.wav",
        correct_answer: "Ẹ kú alẹ́",
      },
      {
        type: "fill_gap_best_option",
        sentence_parts: ["Ẹ káàárọ̀", "__", "ẹ jọ̀ọ́"],
        gap_index: 1,
        options: ["sir", "madam", "friend", "teacher"],
        answer: "sir",
      },
    ],
  },
  lesson_2: {
    title: "Family Terms",
    lesson_id: "YOR-A1-2",
    base_xp: 45,
    exercises: [
      {
        type: "vocabulary",
        question: "Mother",
        options: ["Bàbá", "Ìyá", "Ẹ̀gbọ́n", "Àbúrò"],
        answer: "Ìyá",
        image: "asset/A1/mother.png",
      },
      {
        type: "match_image_to_word",
        image: "asset/A1/father.png",
        options: ["Bàbá", "Ìyá", "Ọmọ", "Ẹ̀gbọ́n"],
        answer: "Bàbá",
      },
      {
        type: "vocabulary",
        question: "Elder sibling",
        options: ["Àbúrò", "Ẹ̀gbọ́n", "Ọmọ", "Ìyá"],
        answer: "Ẹ̀gbọ́n",
      },
      {
        type: "role_play_type_yourself",
        scenario: "Your friend asks 'Ta ni ìyá ẹ?'",
        correct_answers: ["Ìyá mi ni _____", "Orúkọ ìyá mi ni _____"],
        character_image: "asset/Characters/friend.png",
      },
      {
        type: "match_words",
        pairs: [
          ["Bàbá", "Father"],
          ["Ìyá", "Mother"],
          ["Ẹ̀gbọ́n", "Elder sibling"],
          ["Àbúrò", "Younger sibling"],
        ],
      },
      {
        type: "main_idea",
        composition:
          "Tolá introduced his family: 'Ìyá mi ni Mrs. Adeleke. Bàbá mi ni Mr. Adeleke. Mo ní ẹ̀gbọ́n kan àti àbúrò méjì.'",
        question: "How many siblings does Tolá have?",
        options: ["1", "2", "3"],
        answer: "3",
      },
      {
        type: "fill_the_gap",
        sentence_parts: ["Ọmọ", "__", "ni mo jẹ́"],
        gap_index: 1,
        answer: "Àbúrò",
        hint: "Younger sibling",
      },
      {
        type: "tap_what_you_hear",
        audio_path: "asset/audio/father.wav",
        correct_answer: "Bàbá",
        options: ["Bàbá", "Ìyá", "Ọmọ", "Ẹ̀gbọ́n"],
        // image: "asset/A1/father.png", // No image for tap_what_you_hear
      },
      {
        type: "fill_gap_best_option",
        sentence_parts: ["Ẹ̀gbọ́n mi", "__", "ní ilé ìwé"],
        gap_index: 1,
        options: ["wà", "jẹ", "ní", "sí"],
        answer: "wà",
        context: "My elder sibling is at school",
      },
      {
        type: "type_what_you_hear",
        audio_path: "asset/audio/mother.wav",
        correct_answer: "Ìyá",
      },
    ],
  },
  lesson_3: {
    title: "Numbers 1-10",
    lesson_id: "YOR-A1-3",
    base_xp: 35,
    exercises: [
      {
        type: "vocabulary",
        question: "Number 3",
        options: ["Mẹ́ta", "Mẹ́rin", "Márùn", "Mẹ́fà"],
        answer: "Mẹ́ta",
      },
      {
        type: "match_words",
        pairs: [
          ["Ọ̀kan", "One"],
          ["Méjì", "Two"],
          ["Mẹ́ta", "Three"],
          ["Mẹ́rin", "Four"],
        ],
      },
      {
        type: "type_what_you_hear",
        audio_path: "asset/audio/number_5.wav",
        correct_answer: "Márùn",
      },
      {
        type: "fill_the_gap",
        sentence_parts: ["Mo ní", "__", "àwọn ọmọ"],
        gap_index: 1,
        answer: "Mẹ́ta",
        hint: "I have 3 children",
      },
      {
        type: "tap_what_you_hear",
        audio_path: "asset/audio/number_7.wav",
        correct_answer: "Méje",
        options: ["Méje", "Mẹ́jọ", "Mẹ́sàn", "Mẹ́wàá"],
      },
      {
        type: "main_idea",
        composition:
          "Adé ní ọmọ mẹ́ta. Ìyá rẹ̀ ní ọmọ márùn. Bàbá rẹ̀ ní ọmọ méje.",
        question: "How many children does the family have?",
        options: ["15", "10", "5"],
        answer: "15",
      },
      {
        type: "vocabulary",
        question: "Number 10",
        options: ["Mẹ́sàn", "Mẹ́wàá", "Mẹ́jọ", "Márùn"],
        answer: "Mẹ́wàá",
      },
      {
        type: "role_play_options",
        scenario: "The seller asks 'Ẹ fẹ́ mélo?'",
        correct_answer: "Mẹ́ta",
        options: ["Mẹ́ta", "Mẹ́wàá", "Kò sí", "Jọ̀wọ́"],
        character_image: "asset/Characters/seller.png",
      },
      {
        type: "fill_gap_best_option",
        sentence_parts: ["Ọmọ", "__", "ni mo ní"],
        gap_index: 1,
        options: ["Mẹ́ta", "Mẹ́rin", "Márùn"],
        answer: "Mẹ́ta",
        context: "I have 3 children",
      },
      {
        type: "match_image_to_word",
        image: "asset/A1/number_4.png",
        options: ["Mẹ́ta", "Mẹ́rin", "Márùn", "Mẹ́fà"],
        answer: "Mẹ́rin",
      },
    ],
  },
  lesson_4: {
    title: "Market Phrases",
    lesson_id: "YOR-A1-4",
    base_xp: 50,
    exercises: [
      {
        type: "vocabulary",
        question: "How much?",
        options: ["Ẹ ṣé", "Elo ni?", "Jọ̀wọ́", "Dáadáa ni"],
        answer: "Elo ni?",
      },
      {
        type: "tap_what_you_hear",
        audio_path: "asset/audio/how_much.wav",
        correct_answer: "Elo ni?",
        options: ["Elo ni?", "Dúró", "Jọ̀wọ́", "Mo rí ẹ"],
      },
      {
        type: "role_play_options",
        scenario: "The seller says 'Elo ni ọgẹdẹ?'",
        correct_answer: "Mẹ́ta ni!",
        options: ["Mẹ́ta ni!", "Jọ̀wọ́", "Ẹ ṣé", "Kò sí"],
        character_image: "asset/Characters/seller.png",
      },
      {
        type: "main_idea",
        composition:
          "Tolá asked 'Elo ni ọgẹdẹ?' The seller replied 'Mẹ́wàá ni'. Tolá said 'Jọ̀wọ́, máa ra mẹ́fà nìkan'",
        question: "What happened?",
        options: [
          "Tolá negotiated banana prices",
          "Tolá greeted the seller",
          "Tolá thanked the seller",
        ],
        answer: "Tolá negotiated banana prices",
      },
      {
        type: "fill_the_gap",
        sentence_parts: ["__", "ni ọgẹdẹ?"],
        gap_index: 0,
        answer: "Elo",
        hint: "Asking about price",
      },
      {
        type: "match_words",
        pairs: [
          ["Elo ni?", "How much?"],
          ["Jọ̀wọ́", "Please"],
          ["Mẹ́ta ni", "It's three"],
          ["Dáadáa ni", "It's good"],
        ],
      },
      {
        type: "vocabulary",
        question: "Too expensive",
        options: ["Púpọ̀", "Kéré", "O wúwo", "Dúró"],
        answer: "O wúwo",
      },
      {
        type: "type_what_you_hear",
        audio_path: "asset/audio/too_expensive.wav",
        correct_answer: "O wúwo",
      },
      {
        type: "fill_gap_best_option",
        sentence_parts: ["Jọ̀wọ́", "__", "diẹ"],
        gap_index: 1,
        options: ["ṣe", "rẹ", "fi", "pa"],
        answer: "fi",
        context: "Please reduce it (literally 'make it small')",
      },
      {
        type: "match_image_to_word",
        image: "asset/A1/market.png",
        options: ["Ọjà", "Ilé", "Ọfìsì", "Bàtà"],
        answer: "Ọjà",
      },
    ],
  },
  lesson_5: {
    title: "Food & Dining",
    lesson_id: "YOR-A1-5",
    base_xp: 45,
    exercises: [
      {
        type: "vocabulary",
        question: "Rice",
        options: ["Iṣu", "Ọkà", "Ìrẹsì", "Ẹran"],
        answer: "Ìrẹsì",
        image: "asset/A1/rice.png",
      },
      {
        type: "match_image_to_word",
        image: "asset/A1/beans.png",
        options: ["Ẹran", "Ẹ̀wà", "Ọkà", "Oyín"],
        answer: "Ẹ̀wà",
      },
      {
        type: "tap_what_you_hear",
        audio_path: "asset/audio/water.wav",
        correct_answer: "Omi",
        options: ["Omi", "Ọtí", "Oyín", "Pápá"],
      },
      {
        type: "role_play_options",
        scenario: "Your host asks 'Ẹ fẹ́ ounjú mí?'",
        correct_answer: "Bẹ́ẹ̀ ni, ẹ ṣé!",
        options: ["Bẹ́ẹ̀ ni, ẹ ṣé!", "Rárá", "Jọ̀wọ́", "Elo ni?"],
        character_image: "asset/Characters/host.png",
      },
      {
        type: "main_idea",
        composition: "Mo fẹ́ ìrẹsì àti ẹ̀wà. Mo tún fẹ́ omi. Mo kò fẹ́ ọtí.",
        question: "What does the speaker want?",
        options: ["Rice, beans and water", "Beans and drinks", "Only water"],
        answer: "Rice, beans and water",
      },
      {
        type: "fill_the_gap",
        sentence_parts: ["Mo fẹ́", "__", "jẹun"],
        gap_index: 1,
        answer: "ìrẹsì",
        hint: "Popular grain food",
      },
      {
        type: "match_words",
        pairs: [
          ["Ìrẹsì", "Rice"],
          ["Ẹ̀wà", "Beans"],
          ["Omi", "Water"],
          ["Ọtí", "Alcohol"],
        ],
      },
      {
        type: "vocabulary",
        question: "Delicious",
        options: ["Dúdú", "Dáadáa", "O wúwo", "O dùn"],
        answer: "O dùn",
      },
      {
        type: "type_what_you_hear",
        audio_path: "asset/audio/delicious.wav",
        correct_answer: "O dùn",
      },
      {
        type: "fill_gap_best_option",
        sentence_parts: ["Ounje yìí", "__", "púpọ̀"],
        gap_index: 1,
        options: ["dùn", "jẹ", "wà", "ní"],
        answer: "dùn",
        context: "This food is very delicious",
      },
    ],
  },
};

export const getModules = () => {
  const lessonsArray = Object.values(getAllLessons);
  const modules = [];
  for (let i = 0; i < lessonsArray.length; i += 4) {
    const moduleLessons = lessonsArray.slice(i, i + 4);
    modules.push({
      module_id: `module_${Math.floor(i / 4) + 1}`,
      title: `Module ${Math.floor(i / 4) + 1}: ${moduleLessons[0].title} - ${
        moduleLessons[moduleLessons.length - 1].title
      }`,
      lessons: moduleLessons.map((lesson) => lesson.lesson_id),
    });
  }
  return modules;
};
