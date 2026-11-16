/* 밤의 목장 — js/i18n.js : LANG_DATA(ko/en/ja) · applyLang()
   (일반 스크립트. index.html 맨 아래에 적힌 순서대로 불러옵니다) */

/* ═══════════════════════════════════════
   다국어 (i18n)
═══════════════════════════════════════ */
const LANG_DATA = {
    ko: {
        /* 환영 */
        wc_title:'오늘 밤, 하나님과 함께하세요', wc_desc:'밤의 목장 — 오늘 밤, 주님이 누이시는 곳',
        wc_ask:'어떻게 불러드릴까요?', wc_sub:'이름을 입력하시면\n더 따뜻하게 맞이할게요.',
        wc_ph:'이름을 입력해주세요', wc_start:'시작하기', wc_skip:'나중에 할게요',
        /* 스텝 */
        ht_label:'✦ 오늘의 묵상 ✦',
        s1_title:'오늘은 어땠나요?', s1_sub:'오늘 내 감정을, 말씀으로 만나요',
        s2_title:'무엇이 가장 마음에 남았나요?', s3_title:'지금 어떤 마음이 드세요?',
        emo:['감사했어요','평안했어요','걱정이 있었어요','지쳤어요','마음이 아팠어요','기도하고 싶어요'],
        topic:['일','가족','공부','사람','잘 모르겠어요'],
        need:['위로받고 싶어요','힘을 얻고 싶어요','방향이 필요해요','그냥 쉬고 싶어요'],
        /* 결과 버튼 */
        btn_copy:'📋 복사', btn_share:'📤 공유', btn_save:'⭐ 즐겨찾기', btn_saved:'★ 저장됨', btn_restart:'처음으로',
        btn_finish:'오늘 묵상 마치기', closing_extend_hint:'· 연장하기', closing_extended:'5분 더 볼게요',
        btn_vault_closing:'📖 보관함 보기',
        pm_title:'프리미엄', pm_desc:'무료는 최근 60일을 함께해요.\n프리미엄은 당신의 모든 밤을 평생 간직해요.',
        pm_f1:'📔 일기·감정 기록 평생 보관', pm_f2:'📄 PDF 내보내기 — 나의 신앙 일기장',
        pm_f3:'📊 월간·연간 리포트 — 돌보심의 기록', pm_f4:'🗓️ 묵상 캘린더 + 시즌 챌린지',
        pm_f5:'🐑 양 꾸미기 — 매월 새 소품',
        pm_f6:'🎨 감성 배경 테마 4종 — 새벽빛·숲속·바다·노을',
        vb_guest_title:'☁️ 로그인하면 이런 게 가능해요', vb_guest_desc:'여러 기기에서 이어보기 · 감정 기록 자동 백업 · 기기를 바꿔도 안전하게',
        vb_guest_btn:'Google로 로그인',
        vb_free_title:'📔 무료는 최근 60일까지 보관돼요', vb_free_desc:'프리미엄은 모든 기록을 평생 보관하고, PDF 신앙 일기장·월간 리포트·테마도 함께 열려요',
        vb_free_btn:'프리미엄 알아보기',
        vb_premium_badge:'💎 프리미엄 이용 중 — 모든 기록이 평생 보관돼요',
        pm_price:'월 ₩1,900 · 연 ₩19,000 (2달 무료)', pm_cta:'🔔 출시 알림 받기',
        pm_cta_done:'신청 완료! 준비되면 가장 먼저 알려드릴게요 🙏', pm_close:'닫기',
        pm_lock_title:'월간 리포트 & PDF 내보내기', pm_lock_sub:'프리미엄에서 만나요 · ₩1,900/월',
        pat_neg_2:'🌙 어제도 오늘도 마음이 무거우셨네요. 그럴수록 곁에 계신 하나님을 기억해요.',
        pat_neg_n:'🌙 벌써 {n}일째 이어지는 마음이에요. 혼자 견디지 마세요 — 하나님이 알고 계세요.',
        pat_pos_n:'✨ {n}일째 감사와 평안이 이어지고 있어요. 그 마음, 참 귀해요.',
        pat_pray_n:'🙏 {n}일째 기도로 하루를 맺고 있어요. 그 기도, 하늘에 쌓이고 있습니다.',
        toast_img_saved:'🖼️ 말씀 카드 이미지가 저장됐어요',
        closing_title:'오늘도 수고하셨어요',
        closing_msgs:{
            감사:'감사하는 마음이 흘렀던 오늘,\n하나님이 그 마음을 기뻐하십니다.',
            평안:'평안했던 오늘 하루,\n그 고요함도 하나님의 선물입니다.',
            걱정:'걱정을 안고도 여기까지 오셨네요.\n하나님이 그 무거움을 아십니다.',
            지침:'지친 몸과 마음으로 오늘을 버텨내셨어요.\n하나님이 당신의 쉼을 준비하십니다.',
            아픔:'아팠던 오늘, 외롭지 않으셨으면 해요.\n하나님이 그 마음 곁에 계십니다.',
            기도:'기도하고 싶다는 그 마음,\n이미 하나님께 닿아 있습니다.'
        },
        closing_default:'이 고요한 순간,\n하나님이 함께하셨습니다.',
        lbl_music:'배경 음악', music_row:'🎵 배경 음악',
        music_sub_idle:'하루의 끝, 잔잔한 찬송가 연주와 함께해요',
        music_on:'재생 중 🎵', music_off:'일시정지됨',
        music_vol:'볼륨', music_song:'곡 선택', song_all:'전체 반복',
        song_0:'나 같은 죄인 살리신', song_1:'죄짐 맡은 우리 구주', song_2:'거룩 거룩 거룩', song_3:'주 음성 외에는', song_4:'저 장미꽃 위에 이슬',
        song_5:'큰 죄에 빠진 날 위해', song_6:'구주 예수 의지함이', song_7:'해보다 더 밝은 저 천국', song_8:'주의 친절한 팔에 안기세', song_9:'나의 죄를 씻기는',
        /* 보관함 */
        vault_title:'🌙 나의 보관함', vault_back:'← 돌아가기', vault_sub:'별빛 아래 차곡차곡 쌓인 나의 기록',
        v_tab_journal:'🌙 감정 · 통계', v_tab1:'⭐ 즐겨찾기',
        vault_sec_stats:'이번 주 마음 날씨', vault_sec_mood:'하루하루의 기록',
        vault_empty_saved:'아직 즐겨찾기한 항목이 없어요.<br>말씀 카드의 ⭐ 버튼을 눌러 저장해 보세요.',
        vault_empty_mood:'아직 기록이 없어요.<br>오늘의 감정을 남기면 여기에 쌓여요.',
        pag_prev:'← 이전', pag_next:'다음 →',
        /* 설정 */
        settings_title:'⚙️ 설정', settings_back:'← 돌아가기',
        lbl_lang:'언어 / Language', lbl_theme:'배경 테마', lbl_font:'글자 크기',
        lbl_personal:'개인 정보', lbl_data:'데이터 관리', lbl_app:'앱 정보',
        th_night:'밤하늘', th_dawn:'새벽빛', th_forest:'숲속', th_ocean:'바다', th_ember:'노을',
        fo_sm:'기본', fo_md:'크게', fo_lg:'매우 크게',
        row_name:'이름 변경', name_prefix:'현재: ', name_none:'설정되지 않음', row_name_btn:'변경',
        row_export:'기록 내보내기', row_export_sub:'감정 기록 · 일기를 텍스트로 복사', row_export_btn:'내보내기',
        row_reset:'데이터 초기화', row_reset_sub:'보관함 · 기록 · 방문 기록 삭제', row_reset_btn:'초기화',
        row_update:'업데이트 확인', row_update_btn:'확인', row_app_desc:'오늘 밤, 주님이 누이시는 곳',
        privacy:'🔒 저장된 기록은 기기 내에만 보관되며,<br>외부 서버로 수집되지 않습니다.',
        /* 결과 섹션 */
        sec_verse:'오늘의 말씀', sec_story:'오늘의 이야기', sec_prayer:'오늘의 기도',
        sec_sentence:'오늘의 한 문장', sec_diary:'감사 한 줄 일기', sec_enc:'당신을 위한 응원',
        /* 일기 */
        diary_label:'오늘 딱 한 줄, 마음에 남는 것을 남겨보세요.',
        diary_ph:'아무리 작은 것도 괜찮아요...',
        diary_saved:'✓ 저장되었어요. 그 마음, 하나님이 받으셨어요.',
        /* 체크인 */
        cp_text:'오늘 출석 완료', streak_unit:'일 연속',
        /* 날짜·환영 */
        locale:'ko-KR',
        welcome_msgs:['오늘도 수고 많으셨어요.','천천히, 지금 이 순간만요.','당신의 오늘을 들을게요.','잠시 내려놓아도 괜찮아요.','오늘 하루도 참 잘 버티셨어요.','하나님 앞에서, 있는 그대로요.','오늘도 은혜로운 하루였어요.'],
        month_names:['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
        day_names:['일','월','화','수','목','금','토'],
        /* 업데이트 */
        upd_btn:'확인', upd_btn_checking:'확인 중...', upd_btn_apply:'지금 업데이트',
        upd_ready:'새 버전이 준비됐어요!', upd_latest:'최신 버전입니다.', upd_latest_v:'✓ 현재 최신 버전입니다.',
        upd_file:'PC 로컬 파일 실행 중 (웹 환경에서만 지원)', upd_checking:'서버에서 최신 버전 확인 중...',
        upd_ready_msg:'새 버전이 준비됐어요! 아래 버튼으로 적용하세요.',
        upd_fail:'확인 실패. 네트워크를 확인해주세요.', upd_no_sw:'앱이 설치되지 않았습니다.',
        upd_manual:'모바일 또는 웹 환경에서만 지원됩니다.', upd_click:'확인하려면 버튼을 누르세요.',
        /* 토스트·확인창 */
        toast_copied:'말씀이 복사되었습니다 📋', toast_saved_verse:'즐겨찾기에 저장되었습니다 ⭐',
        toast_diary_saved:'감사 일기가 저장되었습니다 ✨',
        toast_exported:'클립보드에 복사되었습니다 📋', toast_reset:'초기화되었습니다',
        confirm_reset:'저장된 말씀, 감정 기록이 모두 삭제됩니다. 계속하시겠어요?',
        /* QR 공유 */
        row_qr:'QR로 공유', row_qr_sub:'QR 코드로 앱을 공유하세요',
        qr_copied:'링크가 복사되었습니다 📋',
        row_fullscreen:'전체화면 보기', row_fullscreen_sub:'앱을 전체화면으로 전환',
        fullscreen_on:'켜기', fullscreen_off:'끄기',
        fullscreen_unsupported:'홈 화면에 추가하면 자동으로 전체화면으로 실행됩니다',
        row_install:'홈 화면에 추가', row_install_sub:'스마트폰 아이콘으로 설치하기', row_install_btn:'추가',
        install_unavailable:'이미 설치되어 있거나 지원되지 않는 환경입니다',
        already_installed:'이미 앱으로 실행 중입니다 ✓',
        lbl_feedback_cat:'피드백',
        row_feedback:'의견 남기기', row_feedback_sub:'베타 피드백을 보내주세요',
        row_feedback_btn:'보내기',
        install_nudge_3:'🌟 3일 연속 달성!', install_nudge_7:'🔥 7일 연속 달성!',
        install_nudge_sub:'홈 화면에 추가하면 더 편리해요',
        install_nudge_add:'추가하기', install_nudge_skip:'다음에',
        /* 공유 */
        share_title:'오늘의 말씀', share_app:'🌙 밤의 목장',
        /* 절기 */
        season_msg:{
            christmas:'🎄 예수님의 탄생을 기다리는 계절입니다.\n오늘 밤도 그 빛 안에서 쉬어가세요.',
            newyear:'🎊 새해가 밝았습니다.\n하나님과 함께하는 새로운 시작을 축복합니다.',
            easter:'🌷 주님의 부활을 묵상하는 계절입니다.\n생명과 소망이 당신과 함께합니다.',
            chuseok:'🌾 풍성한 추석입니다.\n가족과 감사의 마음을 나누는 날 되세요.',
        },
    },
    en: {
        /* 환영 */
        wc_title:'Tonight, rest in God\'s presence', wc_desc:'Night Pasture — where He lays you down to rest',
        wc_ask:'What shall we call you?', wc_sub:'Enter your name for\na warmer welcome.',
        wc_ph:'Your name', wc_start:'Get Started', wc_skip:'Skip for now',
        /* 스텝 */
        ht_label:'✦ Today\'s Verse ✦',
        s1_title:'How was your day?', s1_sub:'A moment to reflect',
        s2_title:'What stayed on your mind?', s3_title:'What do you need right now?',
        emo:['Grateful','At peace','Worried','Exhausted','Heartbroken','Need prayer'],
        topic:['Work','Family','Study','People','Not sure'],
        need:['Comfort','Strength','Direction','Rest'],
        /* 결과 버튼 */
        btn_copy:'📋 Copy', btn_share:'📤 Share', btn_save:'⭐ Bookmark', btn_saved:'★ Saved', btn_restart:'Back to Start',
        btn_finish:'Finish Today’s Reflection', closing_extend_hint:'· Extend', closing_extended:'5 more minutes',
        btn_vault_closing:'📖 View Saved Verses',
        pm_title:'Premium', pm_desc:'Free keeps your last 60 days.\nPremium keeps every night, forever.',
        pm_f1:'📔 Keep all diary & mood records forever', pm_f2:'📄 PDF export — My Faith Journal',
        pm_f3:'📊 Monthly & yearly reports', pm_f4:'🗓️ Devotion calendar + challenges',
        pm_f5:'🐑 Dress up your sheep — new item monthly',
        pm_f6:'🎨 4 mood themes — dawn, forest, ocean, ember',
        vb_guest_title:'☁️ Sign in to unlock', vb_guest_desc:'Continue across devices · auto-backup your mood records · safe even if you switch phones',
        vb_guest_btn:'Sign in with Google',
        vb_free_title:'📔 Free keeps your last 60 days', vb_free_desc:'Premium keeps everything forever, plus PDF journal, monthly reports, and themes',
        vb_free_btn:'See Premium',
        vb_premium_badge:'💎 Premium active — everything is kept forever',
        pm_price:'₩1,900/mo · ₩19,000/yr (2 months free)', pm_cta:'🔔 Notify me at launch',
        pm_cta_done:'Done! You\'ll be the first to know 🙏', pm_close:'Close',
        pm_lock_title:'Monthly report & PDF export', pm_lock_sub:'Coming with Premium · ₩1,900/mo',
        pat_neg_2:'🌙 Yesterday and today, your heart has been heavy. Remember — God is near.',
        pat_neg_n:'🌙 It\'s been {n} days of heaviness. You don\'t have to carry it alone — God knows.',
        pat_pos_n:'✨ {n} days of gratitude and peace in a row. What a precious heart.',
        pat_pray_n:'🙏 {n} days of ending your day in prayer. Those prayers are being kept in heaven.',
        toast_img_saved:'🖼️ Verse card image saved',
        closing_title:'You did well today',
        closing_msgs:{
            감사:'Gratitude flowed through your day.\nGod delights in that heart.',
            평안:'A peaceful day —\nthat quietness, too, is God\'s gift.',
            걱정:'You made it here, worries and all.\nGod knows the weight you carry.',
            지침:'You endured today, tired in body and heart.\nGod is preparing your rest.',
            아픔:'It hurt today. May you not feel alone —\nGod stays close to that heart.',
            기도:'That longing to pray\nhas already reached God.'
        },
        closing_default:'In this quiet moment,\nGod was with you.',
        lbl_music:'Background Music', music_row:'🎵 Background Music',
        music_sub_idle:'End your day with gentle hymn instrumentals',
        music_on:'Playing 🎵', music_off:'Paused',
        music_vol:'Volume', music_song:'Song', song_all:'Play All',
        song_0:'Amazing Grace', song_1:'What a Friend We Have in Jesus', song_2:'Holy, Holy, Holy', song_3:'I Need Thee Every Hour', song_4:'In the Garden',
        song_5:'Just As I Am', song_6:"'Tis So Sweet to Trust in Jesus", song_7:'Sweet By and By', song_8:'Leaning on the Everlasting Arms', song_9:'Nothing but the Blood',
        /* 보관함 */
        vault_title:'🌙 My Vault', vault_back:'← Back', vault_sub:'Your story, gathered under the stars',
        v_tab_journal:'🌙 History & Stats', v_tab1:'⭐ Saved',
        vault_sec_stats:'This Week\'s Heart', vault_sec_mood:'Day by Day',
        vault_empty_saved:'No bookmarks yet.<br>Tap ⭐ on a verse card to save one.',
        vault_empty_mood:'No history yet.<br>Come back daily to build your record.',
        pag_prev:'← Prev', pag_next:'Next →',
        /* 설정 */
        settings_title:'⚙️ Settings', settings_back:'← Back',
        lbl_lang:'Language', lbl_theme:'Theme', lbl_font:'Font Size',
        lbl_personal:'Personal', lbl_data:'Data', lbl_app:'App Info',
        th_night:'Night', th_dawn:'Dawn', th_forest:'Forest', th_ocean:'Ocean', th_ember:'Ember',
        fo_sm:'Regular', fo_md:'Large', fo_lg:'X-Large',
        row_name:'Change Name', name_prefix:'Current: ', name_none:'Not set', row_name_btn:'Change',
        row_export:'Export Data', row_export_sub:'Copy mood log & diary as text', row_export_btn:'Export',
        row_reset:'Reset Data', row_reset_sub:'Delete vault, history & visits', row_reset_btn:'Reset',
        row_update:'Check Updates', row_update_btn:'Check', row_app_desc:'Night Pasture — where He lays you down to rest',
        privacy:'🔒 Your data stays on this device only.<br>Nothing is sent to external servers.',
        /* 결과 섹션 */
        sec_verse:'Today\'s Verse', sec_story:'Today\'s Story', sec_prayer:'Today\'s Prayer',
        sec_sentence:'A Word for Today', sec_diary:'Gratitude Journal', sec_enc:'Encouragement for You',
        /* 일기 */
        diary_label:'Write one thing you\'re grateful for today.',
        diary_ph:'Even small things count...',
        diary_saved:'✓ Saved. A grateful heart is beautiful.',
        /* 체크인 */
        cp_text:'Checked in today', streak_unit:'-day streak',
        /* 날짜·환영 */
        locale:'en-US',
        welcome_msgs:['Well done today.','Take a moment to look back at your day.','Your day matters.','It\'s okay to rest a while.','You made it through today.','Rest a moment with God.','I\'m here to listen.'],
        month_names:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
        day_names:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
        /* 업데이트 */
        upd_btn:'Check', upd_btn_checking:'Checking...', upd_btn_apply:'Update Now',
        upd_ready:'A new version is ready!', upd_latest:'Up to date.', upd_latest_v:'✓ You have the latest version.',
        upd_file:'Running as local file (web only)', upd_checking:'Checking server for updates...',
        upd_ready_msg:'New version ready! Tap the button below to apply.',
        upd_fail:'Check failed. Please check your network.', upd_no_sw:'App is not installed.',
        upd_manual:'Only supported in web/mobile environments.', upd_click:'Press the button to check.',
        /* 토스트·확인창 */
        toast_copied:'Verse copied 📋', toast_saved_verse:'Added to bookmarks ⭐',
        toast_diary_saved:'Gratitude saved ✨',
        toast_exported:'Copied to clipboard 📋', toast_reset:'Data cleared',
        confirm_reset:'All saved verses and mood history will be deleted. Continue?',
        /* QR 공유 */
        row_qr:'Share via QR', row_qr_sub:'Share the app with a QR code',
        qr_copied:'Link copied 📋',
        row_fullscreen:'Full Screen', row_fullscreen_sub:'Switch to fullscreen mode',
        fullscreen_on:'On', fullscreen_off:'Off',
        fullscreen_unsupported:'Add to Home Screen to run fullscreen on iOS',
        row_install:'Add to Home Screen', row_install_sub:'Install as an app icon', row_install_btn:'Add',
        install_unavailable:'Already installed or not supported in this environment',
        already_installed:'Already running as an app ✓',
        lbl_feedback_cat:'Feedback',
        row_feedback:'Leave Feedback', row_feedback_sub:'Send us your beta feedback',
        row_feedback_btn:'Send',
        install_nudge_3:'🌟 3-Day Streak!', install_nudge_7:'🔥 7-Day Streak!',
        install_nudge_sub:'Add to Home Screen for easy access',
        install_nudge_add:'Add Now', install_nudge_skip:'Later',
        /* 공유 */
        share_title:'Today\'s Verse', share_app:'🌙 Night Pasture',
        /* 절기 */
        season_msg:{
            christmas:'🎄 The season of awaiting Jesus\'s birth.\nRest in His light tonight.',
            newyear:'🎊 Happy New Year!\nBlessed new beginnings with God.',
            easter:'🌷 The season of the resurrection.\nLife and hope are with you.',
            chuseok:'🌾 A season of gratitude.\nShare thanks with your family.',
        },
    },
    ja: {
        /* 환영 */
        wc_title:'今夜、神様とともに', wc_desc:'夜の牧場 — 今夜、主が休ませてくださる場所',
        wc_ask:'お名前を教えてください', wc_sub:'名前を入力すると\nより温かくお迎えします。',
        wc_ph:'お名前', wc_start:'はじめる', wc_skip:'あとで',
        /* 스텝 */
        ht_label:'✦ 今日のみことば ✦',
        s1_title:'今日はどんな一日でしたか？', s1_sub:'一日を振り返るひととき',
        s2_title:'一番心に残ったことは？', s3_title:'今、どんな気持ちですか？',
        emo:['感謝した','平和だった','心配があった','疲れた','悲しかった','祈りたい'],
        topic:['仕事','家族','勉強','人間関係','わからない'],
        need:['慰めがほしい','力がほしい','方向が必要','ただ休みたい'],
        /* 결과 버튼 */
        btn_copy:'📋 コピー', btn_share:'📤 共有', btn_save:'⭐ お気に入り', btn_saved:'★ 保存済み', btn_restart:'はじめに戻る',
        btn_finish:'今日の黙想を終える', closing_extend_hint:'· 延長する', closing_extended:'あと5分見ます',
        btn_vault_closing:'📖 保管箱を見る',
        pm_title:'プレミアム', pm_desc:'無料は直近60日をともに。\nプレミアムはすべての夜を永久保存。',
        pm_f1:'📔 日記・感情記録を永久保存', pm_f2:'📄 PDFエクスポート — 私の信仰日記',
        pm_f3:'📊 月間・年間レポート', pm_f4:'🗓️ 黙想カレンダー＋チャレンジ',
        pm_f5:'🐑 ひつじの着せ替え — 毎月新アイテム',
        pm_f6:'🎨 感情テーマ4種 — 夜明け・森・海・夕焼け',
        vb_guest_title:'☁️ ログインするとできること', vb_guest_desc:'複数端末で続き閲覧・感情記録の自動バックアップ・機種変更も安心',
        vb_guest_btn:'Googleでログイン',
        vb_free_title:'📔 無料は直近60日まで保存', vb_free_desc:'プレミアムはすべて永久保存、PDF信仰日記・月間レポート・テーマも解放されます',
        vb_free_btn:'プレミアムを見る',
        vb_premium_badge:'💎 プレミアム利用中 — すべて永久保存されます',
        pm_price:'月 ₩1,900 · 年 ₩19,000（2ヶ月無料）', pm_cta:'🔔 リリース通知を受け取る',
        pm_cta_done:'受付完了！真っ先にお知らせします 🙏', pm_close:'閉じる',
        pm_lock_title:'月間レポート & PDF', pm_lock_sub:'プレミアムで · 月₩1,900',
        pat_neg_2:'🌙 昨日も今日も、心が重い日でしたね。そばにおられる神様を覚えていてください。',
        pat_neg_n:'🌙 もう{n}日続いている心です。一人で抱えないで — 神様はご存知です。',
        pat_pos_n:'✨ {n}日連続で感謝と平安が続いています。尊い心ですね。',
        pat_pray_n:'🙏 {n}日連続、祈りで一日を締めくくっています。その祈りは天に積まれています。',
        toast_img_saved:'🖼️ 御言葉カードを保存しました',
        closing_title:'今日もお疲れさまでした',
        closing_msgs:{
            감사:'感謝の心が流れた今日、\n神様はその心を喜ばれます。',
            평안:'平安だった今日一日、\nその静けさも神様の贈り物です。',
            걱정:'心配を抱えたままここまで来ましたね。\n神様はその重さをご存知です。',
            지침:'疲れた体と心で今日を耐え抜きました。\n神様があなたの休みを備えています。',
            아픔:'つらかった今日、独りではありませんように。\n神様がその心のそばにおられます。',
            기도:'祈りたいというその心は、\nすでに神様に届いています。'
        },
        closing_default:'この静かなひととき、\n神様が共におられました。',
        lbl_music:'BGM', music_row:'🎵 BGM',
        music_sub_idle:'一日の終わりに、静かな賛美歌の調べと共に',
        music_on:'再生中 🎵', music_off:'一時停止中',
        music_vol:'音量', music_song:'曲', song_all:'全曲リピート',
        song_0:'アメイジング・グレイス', song_1:'いつくしみ深き', song_2:'聖なるかな', song_3:'I Need Thee Every Hour', song_4:'In the Garden',
        song_5:'いさおなき我を', song_6:"'Tis So Sweet to Trust in Jesus", song_7:'まもなくかなたの', song_8:'Leaning on the Everlasting Arms', song_9:'Nothing but the Blood',
        /* 보관함 */
        vault_title:'🌙 ボールト', vault_back:'← 戻る', vault_sub:'星あかりの下に積もった私の記録',
        v_tab_journal:'🌙 記録 · 統計', v_tab1:'⭐ お気に入り',
        vault_sec_stats:'今週のこころ模様', vault_sec_mood:'日々の記録',
        vault_empty_saved:'まだお気に入りがありません。<br>みことばカードの⭐で保存できます。',
        vault_empty_mood:'まだ記録がありません。<br>毎日訪れると記録が増えていきます。',
        pag_prev:'← 前へ', pag_next:'次へ →',
        /* 설정 */
        settings_title:'⚙️ 設定', settings_back:'← 戻る',
        lbl_lang:'言語 / Language', lbl_theme:'背景テーマ', lbl_font:'文字サイズ',
        lbl_personal:'個人情報', lbl_data:'データ管理', lbl_app:'アプリ情報',
        th_night:'夜空', th_dawn:'夜明け', th_forest:'森', th_ocean:'海', th_ember:'夕焼け',
        fo_sm:'標準', fo_md:'大きく', fo_lg:'とても大きく',
        row_name:'名前を変更', name_prefix:'現在: ', name_none:'未設定', row_name_btn:'変更',
        row_export:'データを書き出す', row_export_sub:'記録と日記をテキストでコピー', row_export_btn:'書き出す',
        row_reset:'データを初期化', row_reset_sub:'ボールト・記録・訪問履歴を削除', row_reset_btn:'初期化',
        row_update:'アップデートを確認', row_update_btn:'確認', row_app_desc:'夜の牧場 — 今夜、主が休ませてくださる場所',
        privacy:'🔒 保存された記録はこのデバイス内にのみ保管され、<br>外部サーバーには送信されません。',
        /* 결과 섹션 */
        sec_verse:'今日のみことば', sec_story:'今日のお話', sec_prayer:'今日のお祈り',
        sec_sentence:'今日の一言', sec_diary:'感謝の日記', sec_enc:'あなたへの励まし',
        /* 일기 */
        diary_label:'今日感謝したことを一つ書いてみましょう。',
        diary_ph:'小さなことでも大丈夫...',
        diary_saved:'✓ 保存されました。感謝の心は美しいです。',
        /* 체크인 */
        cp_text:'今日のチェックイン完了', streak_unit:'日連続',
        /* 날짜·환영 */
        locale:'ja-JP',
        welcome_msgs:['今日もお疲れ様でした。','ゆっくり今日を振り返りましょう。','あなたの一日は大切です。','少し休んでも大丈夫です。','今日もよく頑張りました。','神様の前でひと息つきましょう。','あなたのお話を聞かせてください。'],
        month_names:['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
        day_names:['日','月','火','水','木','金','土'],
        /* 업데이트 */
        upd_btn:'確認', upd_btn_checking:'確認中...', upd_btn_apply:'今すぐ更新',
        upd_ready:'新しいバージョンが準備できています！', upd_latest:'最新版です。', upd_latest_v:'✓ 最新バージョンです。',
        upd_file:'ローカルファイルとして実行中 (ウェブのみ対応)', upd_checking:'サーバーで最新バージョンを確認中...',
        upd_ready_msg:'新しいバージョンが準備できています！ボタンで適用してください。',
        upd_fail:'確認失敗。ネットワークを確認してください。', upd_no_sw:'アプリがインストールされていません。',
        upd_manual:'モバイルまたはウェブ環境でのみ対応しています。', upd_click:'ボタンを押して確認してください。',
        /* 토스트·확인창 */
        toast_copied:'みことばをコピーしました 📋', toast_saved_verse:'お気に入りに保存しました ⭐',
        toast_diary_saved:'感謝の日記を保存しました ✨',
        toast_exported:'クリップボードにコピーしました 📋', toast_reset:'初期化しました',
        confirm_reset:'保存されたみことばと記録がすべて削除されます。続けますか？',
        /* QR 공유 */
        row_qr:'QRで共有', row_qr_sub:'QRコードでアプリを共有',
        qr_copied:'リンクをコピーしました 📋',
        row_fullscreen:'全画面表示', row_fullscreen_sub:'アプリを全画面で表示',
        fullscreen_on:'オン', fullscreen_off:'オフ',
        fullscreen_unsupported:'ホーム画面に追加すると自動で全画面になります',
        row_install:'ホーム画面に追加', row_install_sub:'アプリアイコンとしてインストール', row_install_btn:'追加',
        install_unavailable:'インストール済みまたは対応環境ではありません',
        already_installed:'アプリとして実行中です ✓',
        lbl_feedback_cat:'フィードバック',
        row_feedback:'ご意見を送る', row_feedback_sub:'ベータフィードバックをお送りください',
        row_feedback_btn:'送信',
        install_nudge_3:'🌟 3日連続達成！', install_nudge_7:'🔥 7日連続達成！',
        install_nudge_sub:'ホーム画面に追加すると便利です',
        install_nudge_add:'追加する', install_nudge_skip:'あとで',
        /* 공유 */
        share_title:'今日のみことば', share_app:'🌙 夜の牧場',
        /* 절기 */
        season_msg:{
            christmas:'🎄 イエス様の誕生を待ち望む季節です。\n今夜もその光の中で安らいでください。',
            newyear:'🎊 あけましておめでとうございます。\n神様とともに新しい始まりをお祝いします。',
            easter:'🌷 主の復活を黙想する季節です。\n命と希望があなたとともにあります。',
            chuseok:'🌾 感謝の季節です。\n家族と感謝を分かち合いましょう。',
        },
    }
};
let appLang = 'ko';
let _wpTimer = null;

function setWelcomeLang(lang) {
    appLang = lang;
    document.querySelectorAll('.lang-btn').forEach((btn,i)=>btn.classList.toggle('active',['ko','en','ja'][i]===lang));
    const L = LANG_DATA[lang]||LANG_DATA.ko;
    const s=(id,t)=>{ const el=document.getElementById(id); if(el) el.textContent=t; };
    s('wc-title', L.wc_title); s('wc-desc', L.wc_desc);
    s('wc-ask', L.wc_ask); s('wc-start', L.wc_start); s('wc-skip', L.wc_skip);
    const sub=document.getElementById('wc-sub'); if(sub) sub.textContent=L.wc_sub;
    const inp=document.getElementById('name-input'); if(inp) inp.placeholder=L.wc_ph;
}

function applyLang(lang) {
    appLang = lang;
    const L = LANG_DATA[lang]||LANG_DATA.ko;
    const q=(sel,cb)=>document.querySelectorAll(sel).forEach(cb);
    const s=(id,t)=>{ const el=document.getElementById(id); if(el) el.textContent=t; };
    const sh=(id,t)=>{ const el=document.getElementById(id); if(el) el.innerHTML=t; };
    // HTML lang 속성 + body 언어 클래스
    document.documentElement.lang = lang==='en'?'en':lang==='ja'?'ja':'ko';
    document.body.className = document.body.className.replace(/\blang-\S+/g,'').trim() + ' lang-'+lang;
    // 히어로 티저 라벨
    if(L.ht_label) s('ht-label', L.ht_label);
    // 스텝 제목
    const s1t=document.querySelector('#step1 .s1-title'), s1s=document.querySelector('#step1 .s1-sub');
    const s2t=document.querySelector('#step2 .step-title'), s3t=document.querySelector('#step3 .step-title');
    if(s1t) s1t.textContent=L.s1_title; if(s1s) s1s.textContent=L.s1_sub;
    if(s2t) s2t.textContent=L.s2_title; if(s3t) s3t.textContent=L.s3_title;
    // 감정/주제/필요 버튼
    q('.e-text',(el,i)=>{ if(L.emo[i]) el.textContent=L.emo[i]; });
    const bcAll=[...document.querySelectorAll('#step2 .bc-text'),...document.querySelectorAll('#step3 .bc-text')];
    [...L.topic,...L.need].forEach((t,i)=>{ if(bcAll[i]) bcAll[i].textContent=t; });
    // 결과 액션 버튼
    const bc=document.getElementById('btn-copy'), bs=document.getElementById('btn-share');
    const bsv=document.getElementById('btn-save'), br=document.querySelector('.btn-restart');
    if(bc) bc.textContent=L.btn_copy; if(bs) bs.textContent=L.btn_share;
    if(bsv&&!bsv.classList.contains('saved')) bsv.textContent=L.btn_save;
    if(br) br.textContent = closingTriggered ? L.btn_restart : L.btn_finish;
    renderClosingTimer();
    // 보관함 오버레이
    s('vault-title',L.vault_title); s('vault-back',L.vault_back); s('vault-sub',L.vault_sub);
    s('vault-sec-stats',L.vault_sec_stats); s('vault-sec-mood',L.vault_sec_mood);
    const tabs=document.querySelectorAll('.vault-tab');
    if(tabs[0]) tabs[0].innerHTML=(L.v_tab_journal||'🌙 감정 · 통계')+'<span class="pm-star"> ✦</span>';
    if(tabs[1]) tabs[1].textContent=L.v_tab1;
    // 설정 오버레이
    s('settings-title',L.settings_title); s('settings-back',L.settings_back);
    s('lbl-lang',L.lbl_lang); s('lbl-theme',L.lbl_theme); s('lbl-font',L.lbl_font);
    s('lbl-personal',L.lbl_personal); s('lbl-data',L.lbl_data); s('lbl-app',L.lbl_app);
    s('th-night-txt',L.th_night); s('th-dawn-txt',L.th_dawn); s('th-forest-txt',L.th_forest);
    s('th-ocean-txt',L.th_ocean); s('th-ember-txt',L.th_ember);
    s('fo-sm-txt',L.fo_sm); s('fo-md-txt',L.fo_md); s('fo-lg-txt',L.fo_lg);
    s('row-name-label',L.row_name); s('row-name-btn',L.row_name_btn);
    s('row-export-label',L.row_export); s('row-export-sub',L.row_export_sub); s('row-export-btn',L.row_export_btn);
    s('row-reset-label',L.row_reset); s('row-reset-sub',L.row_reset_sub); s('row-reset-btn',L.row_reset_btn);
    s('row-update-label',L.row_update); s('row-app-desc',L.row_app_desc);
    s('row-qr-label',L.row_qr); s('row-qr-sub',L.row_qr_sub);
    s('row-fullscreen-label',L.row_fullscreen); s('row-fullscreen-sub',L.row_fullscreen_sub);
    s('row-install-label',L.row_install); s('row-install-sub',L.row_install_sub);
    const ib=document.getElementById('btn-install'); if(ib) ib.textContent=L.row_install_btn;
    const fb=document.getElementById('btn-fullscreen');
    if(fb) fb.textContent=document.fullscreenElement?L.fullscreen_off:L.fullscreen_on;
    s('lbl-feedback-cat',L.lbl_feedback_cat);
    s('row-feedback-label',L.row_feedback); s('row-feedback-sub',L.row_feedback_sub);
    sh('privacy-text',L.privacy);
    // 스트릭 넛지 버튼 텍스트
    const inba=document.getElementById('in-btn-add'); if(inba) inba.textContent=L.install_nudge_add;
    const inbs=document.getElementById('in-btn-skip'); if(inbs) inbs.textContent=L.install_nudge_skip;
    // 결과 섹션 라벨
    s('sec-verse',L.sec_verse); s('sec-story',L.sec_story); s('sec-prayer',L.sec_prayer);
    s('sec-sentence',L.sec_sentence); s('sec-diary',L.sec_diary); s('sec-enc',L.sec_enc);
    // 일기
    s('diary-label',L.diary_label); s('diary-saved-msg',L.diary_saved);
    const di=document.getElementById('diary-input'); if(di) di.placeholder=L.diary_ph;
    // 업데이트 버튼 (특수 상태가 아닐 때만)
    const ubtn=document.getElementById('btn-check-update');
    if(ubtn&&!ubtn.disabled&&ubtn.textContent!==L.upd_btn_apply) ubtn.textContent=L.row_update_btn;
    // 체크인 필 텍스트
    const cpTxt=document.getElementById('cp-text'), cpStr=document.getElementById('cp-streak');
    if(cpTxt) cpTxt.textContent=L.cp_text;
    if(cpStr){ const n=(cpStr.textContent.match(/\d+/)||['1'])[0]; cpStr.textContent=n+L.streak_unit; }
    // 마무리(클로징) 카드
    s('blessing-title',L.closing_title);
    if (sel && sel.emotion) {
        const bsub=document.getElementById('blessing-sub');
        if (bsub) bsub.innerHTML=((L.closing_msgs||{})[sel.emotion]||L.closing_default).replace(/\n/g,'<br>');
    }
    const bvc=document.getElementById('btn-vault-closing');
    if (bvc) bvc.textContent=L.btn_vault_closing;
    // 배경 음악
    s('lbl-music',L.lbl_music); s('music-row-label',L.music_row);
    const msub=document.getElementById('music-status-sub');
    if (msub) msub.textContent = hymnOn ? L.music_on : L.music_sub_idle;
    s('lbl-vol',L.music_vol); s('lbl-song',L.music_song);
    s('chip-song-all',L.song_all); s('chip-song-0',L.song_0); s('chip-song-1',L.song_1);
    s('chip-song-2',L.song_2); s('chip-song-3',L.song_3); s('chip-song-4',L.song_4);
    s('chip-song-5',L.song_5); s('chip-song-6',L.song_6); s('chip-song-7',L.song_7);
    s('chip-song-8',L.song_8); s('chip-song-9',L.song_9);
    updatePlayerUI();
    // 날짜·환영 갱신
    setDate(); setWelcome();
    // v2.7 추가 UI (처리방침·동의·계정 삭제·회고 카드·돌봄 안내)
    applyLangV27();
}

function startWelcomeParticles() {
    const c=document.getElementById('welcome-particles'); if(!c) return;
    const sym=['🌸','✨','⭐','🌟','💫','🌷','🌺','🍀','🌼','💐'];
    function spawn() {
        if(document.getElementById('overlay-name').classList.contains('hidden')) return;
        const el=document.createElement('div'); el.className='wp';
        const sz=11+Math.random()*15, dur=5+Math.random()*5;
        el.textContent=sym[Math.floor(Math.random()*sym.length)];
        el.style.cssText=`left:${3+Math.random()*94}%;font-size:${sz}px;animation-duration:${dur}s;`;
        c.appendChild(el); setTimeout(()=>el.remove(),(dur+.5)*1000);
        _wpTimer=setTimeout(spawn,260+Math.random()*340);
    }
    spawn();
}
