import { STORY_COPY } from './story-copy';
import { LOCALES, type Locale } from './state';
export const LANGUAGE_NAMES:Record<Locale,string>={'zh-CN':'简体中文','zh-TW':'繁體中文',en:'English',ja:'日本語',ko:'한국어'};
// Stable IDs separate puzzle logic from its five language editions.
export const COPY:Record<string,readonly [string,string,string,string,string]>={
 "title": [
  "未赴之约",
  "未赴之約",
  "Promises Yet to Keep",
  "果たされなかった約束",
  "아직 남은 약속"
 ],
 "castle": [
  "霍格沃茨",
  "霍格華茲",
  "Hogwarts",
  "ホグワーツ",
  "호그와트"
 ],
 "subtitle": [
  "城堡里，还有几件事等着你。",
  "城堡裡，還有幾件事等著你。",
  "There are still a few things to do at the castle.",
  "城には、まだあなたを待つ用事がある。",
  "성에는 아직 당신을 기다리는 일이 있다."
 ],
 "edition": [
  "单机叙事探索 · 第一章",
  "單機敘事探索 · 第一章",
  "A single-player story · Chapter I",
  "ひとりで巡る物語 · 第一章",
  "싱글 플레이 이야기 · 제1장"
 ],
 "start": [
  "开启这个夜晚",
  "開啟這個夜晚",
  "Begin this evening",
  "この夜を始める",
  "이 밤을 시작하기"
 ],
 "continue": [
  "继续赴约",
  "繼續赴約",
  "Continue your story",
  "約束の続きを",
  "이야기 이어가기"
 ],
 "explore": [
  "自由漫游",
  "自由漫遊",
  "Explore the castle",
  "城を自由に歩く",
  "성 자유 탐험"
 ],
 "loading": [
  "正在点亮城堡",
  "正在點亮城堡",
  "Lighting the castle",
  "城に灯りをともしています",
  "성에 불을 밝히는 중"
 ],
 "loadingNote": [
  "请稍候，城堡正在载入。",
  "請稍候，城堡正在載入。",
  "Please wait while the castle loads.",
  "城を読み込んでいます。少々お待ちください。",
  "성을 불러오고 있어요. 잠시만 기다려 주세요."
 ],
 "overview": [
  "城堡全景",
  "城堡全景",
  "Castle view",
  "城の全景",
  "성 전경"
 ],
 "map": [
  "城堡地图",
  "城堡地圖",
  "Castle map",
  "城の地図",
  "성 지도"
 ],
 "mapDesc": [
  "沿着灯火去寻找，也可以直接前往一处入口。",
  "沿著燈火去尋找，也可以直接前往一處入口。",
  "Follow the lights, or travel to a room’s entrance.",
  "灯りをたどっても、入口へ直接向かっても。",
  "불빛을 따라가거나 장소의 입구로 바로 이동하세요."
 ],
 "settings": [
  "设置",
  "設定",
  "Settings",
  "設定",
  "설정"
 ],
 "journal": [
  "故事册",
  "故事冊",
  "Story journal",
  "物語の手帳",
  "이야기 수첩"
 ],
 "chapter": [
  "当前章节",
  "目前章節",
  "Your chapter",
  "現在の章",
  "진행 중인 장"
 ],
 "secrets": [
  "城堡的小秘密",
  "城堡的小祕密",
  "Small castle secrets",
  "城の小さな秘密",
  "성의 작은 비밀"
 ],
 "aim": [
  "下一件事",
  "下一件事",
  "What comes next",
  "次にすること",
  "다음 할 일"
 ],
 "guide": [
  "前往这处入口",
  "前往這處入口",
  "Travel to the entrance",
  "この場所の入口へ",
  "이 장소 입구로"
 ],
 "nearby": [
  "靠近发光的物件，看看它留下了什么。",
  "靠近發光的物件，看看它留下了什麼。",
  "Approach the softly glowing object.",
  "淡く光るものに近づいてみよう。",
  "은은하게 빛나는 물건에 다가가 보세요."
 ],
 "interact": [
  "查看",
  "查看",
  "Examine",
  "調べる",
  "살펴보기"
 ],
 "close": [
  "关闭",
  "關閉",
  "Close",
  "閉じる",
  "닫기"
 ],
 "back": [
  "返回",
  "返回",
  "Back",
  "戻る",
  "돌아가기"
 ],
 "next": [
  "继续",
  "繼續",
  "Continue",
  "続ける",
  "계속"
 ],
 "confirm": [
  "确认",
  "確認",
  "Confirm",
  "決定",
  "확인"
 ],
 "retry": [
  "再试一次",
  "再試一次",
  "Try again",
  "もう一度",
  "다시 시도"
 ],
 "hint": [
  "一点提示",
  "一點提示",
  "A little help",
  "ヒントを見る",
  "힌트 보기"
 ],
 "resetPuzzle": [
  "重新摆放",
  "重新擺放",
  "Reset arrangement",
  "並べ直す",
  "다시 놓기"
 ],
 "solved": [
  "已经办妥了。",
  "已經辦妥了。",
  "That is taken care of.",
  "これでよし。",
  "이제 됐다."
 ],
 "soundOn": [
  "开启环境音",
  "開啟環境音",
  "Enable ambient sound",
  "環境音をオン",
  "환경음 켜기"
 ],
 "soundOff": [
  "关闭环境音",
  "關閉環境音",
  "Mute ambient sound",
  "環境音をオフ",
  "환경음 끄기"
 ],
 "sound": [
  "环境音",
  "環境音",
  "Ambient sound",
  "環境音",
  "환경음"
 ],
 "soundDesc": [
  "风声、脚步与轻柔的魔法回响。",
  "風聲、腳步與輕柔的魔法迴響。",
  "Wind, footsteps, and quiet traces of magic.",
  "風、足音、かすかな魔法の響き。",
  "바람과 발소리, 잔잔한 마법의 울림."
 ],
 "language": [
  "语言",
  "語言",
  "Language",
  "言語",
  "언어"
 ],
 "languageDesc": [
  "即时切换，保留故事进度。",
  "即時切換，保留故事進度。",
  "Switch at any time. Your progress stays.",
  "進行状況を保ったまま切り替えられます。",
  "진행 상황은 그대로, 언제든 바꿀 수 있어요."
 ],
 "quality": [
  "画面细节",
  "畫面細節",
  "Visual detail",
  "描画品質",
  "화면 품질"
 ],
 "auto": [
  "自适应",
  "自適應",
  "Adaptive",
  "自動調整",
  "자동 조절"
 ],
 "high": [
  "精细",
  "精細",
  "Detailed",
  "高精細",
  "정밀"
 ],
 "low": [
  "流畅",
  "流暢",
  "Smooth",
  "軽量",
  "원활"
 ],
 "qualityDesc": [
  "根据设备性能调整光影和渲染精度。",
  "依裝置效能調整光影與算繪精度。",
  "Adjust lighting and resolution for your device.",
  "端末に合わせて光と解像度を調整します。",
  "기기 성능에 맞춰 조명과 해상도를 조절해요."
 ],
 "save": [
  "本机存档",
  "本機存檔",
  "Local save",
  "この端末のセーブ",
  "기기 저장"
 ],
 "unsaved": [
  "尚未保存",
  "尚未儲存",
  "Not saved",
  "未保存",
  "저장되지 않음"
 ],
 "saved": [
  "进度已保存",
  "進度已儲存",
  "Progress saved",
  "保存しました",
  "진행 상황 저장됨"
 ],
 "recovered": [
  "已从备份恢复进度。",
  "已從備份復原進度。",
  "Progress restored from a backup.",
  "バックアップから復元しました。",
  "백업에서 진행 상황을 복원했어요."
 ],
 "saveError": [
  "此浏览器暂时无法保存。请导出存档，避免丢失进度。",
  "此瀏覽器暫時無法儲存。請匯出存檔，避免遺失進度。",
  "This browser cannot save right now. Export a copy to keep your progress.",
  "今はブラウザに保存できません。進行状況をファイルに書き出してください。",
  "현재 브라우저에 저장할 수 없어요. 진행 상황을 파일로 내보내 주세요."
 ],
 "corrupt": [
  "原存档无法读取，尚未覆盖。可导入备份，或开始新的故事。",
  "原存檔無法讀取，尚未覆寫。可匯入備份，或開始新的故事。",
  "The existing save could not be read and has not been overwritten. Import a backup or begin a new story.",
  "既存のセーブを読み込めません。まだ上書きしていません。バックアップを読み込むか、新しく始められます。",
  "기존 저장 파일을 읽을 수 없어 덮어쓰지 않았어요. 백업을 불러오거나 새로 시작하세요."
 ],
 "export": [
  "导出存档",
  "匯出存檔",
  "Export save",
  "セーブを書き出す",
  "저장 파일 내보내기"
 ],
 "import": [
  "导入存档",
  "匯入存檔",
  "Import save",
  "セーブを読み込む",
  "저장 파일 가져오기"
 ],
 "importError": [
  "文件不是可用的本游戏存档，现有进度未改变。",
  "檔案不是可用的本遊戲存檔，目前進度未變更。",
  "This is not a compatible save. Your current progress is unchanged.",
  "対応するセーブではありません。現在の進行状況は変更されていません。",
  "호환되는 저장 파일이 아니에요. 현재 진행 상황은 그대로예요."
 ],
 "importConfirm": [
  "用此存档替换当前进度？当前进度会先保留为备份。",
  "以此存檔取代目前進度？目前進度會先保留為備份。",
  "Replace current progress with this save? A backup will be kept first.",
  "このセーブに切り替えますか？現在の進行状況は先にバックアップします。",
  "이 저장 파일로 바꿀까요? 현재 진행 상황은 먼저 백업해 둘게요."
 ],
 "newGame": [
  "重新开始",
  "重新開始",
  "New story",
  "初めから",
  "새 이야기"
 ],
 "newConfirm": [
  "重新开始会替换本机进度。建议先导出一份存档。",
  "重新開始會取代本機進度。建議先匯出一份存檔。",
  "Starting again replaces this device’s progress. Export a copy first if you want to keep it.",
  "初めから始めると、この端末の進行状況が置き換わります。残したい場合は先に書き出してください。",
  "새로 시작하면 이 기기의 진행 상황이 바뀌어요. 보관하려면 먼저 파일로 내보내 주세요."
 ],
 "offline": [
  "离线可用",
  "離線可用",
  "Ready offline",
  "オフライン準備完了",
  "오프라인 준비 완료"
 ],
 "caching": [
  "正在准备离线资源",
  "正在準備離線資源",
  "Preparing offline files",
  "オフライン用データを準備中",
  "오프라인 자료 준비 중"
 ],
 "onlineOnly": [
  "资源载入后可游玩；当前环境未启用离线重开。",
  "資源載入後可遊玩；目前環境未啟用離線重開。",
  "Playable after loading. Offline reopening is not enabled in this environment.",
  "読み込み後は遊べます。この環境ではオフラインでの再起動は未対応です。",
  "자료를 불러오면 플레이할 수 있어요. 현재 환경은 오프라인 재실행을 지원하지 않아요."
 ],
 "localOnly": [
  "进度保存在此浏览器，不会自动同步到其他设备。",
  "進度儲存在此瀏覽器，不會自動同步至其他裝置。",
  "Saved in this browser. Other devices do not sync automatically.",
  "このブラウザに保存します。ほかの端末とは自動同期しません。",
  "이 브라우저에 저장돼요. 다른 기기와 자동 동기화되지 않아요."
 ],
 "lumos": [
  "荧光闪烁",
  "路摸思",
  "Lumos",
  "ルーモス",
  "루모스"
 ],
 "nox": [
  "诺克斯",
  "熄滅",
  "Nox",
  "ノックス",
  "녹스"
 ],
 "cast": [
  "施法",
  "施法",
  "Cast",
  "呪文",
  "주문"
 ],
 "controls": [
  "左侧移动 · 右侧轻划环视",
  "左側移動 · 右側輕滑環視",
  "Move on the left · Look around on the right",
  "左で移動 · 右をスワイプして見回す",
  "왼쪽으로 이동 · 오른쪽을 밀어 둘러보기"
 ],
 "joystick": [
  "移动摇杆",
  "移動搖桿",
  "Movement joystick",
  "移動スティック",
  "이동 조이스틱"
 ],
 "rotate": [
  "拖动环视 · 滚轮缩放",
  "拖曳環視 · 滾輪縮放",
  "Drag to look · Scroll to zoom",
  "ドラッグで見回す · スクロールで拡大縮小",
  "드래그로 둘러보기 · 스크롤로 확대"
 ],
 "visited": [
  "已探索",
  "已探索",
  "Explored",
  "探索済み",
  "탐험한 곳"
 ],
 "house": [
  "我的学院",
  "我的學院",
  "Your house",
  "あなたの寮",
  "나의 기숙사"
 ],
 "gryffindor": [
  "格兰芬多",
  "葛來分多",
  "Gryffindor",
  "グリフィンドール",
  "그리핀도르"
 ],
 "ravenclaw": [
  "拉文克劳",
  "雷文克勞",
  "Ravenclaw",
  "レイブンクロー",
  "래번클로"
 ],
 "hufflepuff": [
  "赫奇帕奇",
  "赫夫帕夫",
  "Hufflepuff",
  "ハッフルパフ",
  "후플푸프"
 ],
 "slytherin": [
  "斯莱特林",
  "史萊哲林",
  "Slytherin",
  "スリザリン",
  "슬리데린"
 ],
 "bridge": [
  "高架石桥",
  "高架石橋",
  "The Viaduct",
  "高架橋",
  "고가 돌다리"
 ],
 "courtyard": [
  "钟楼庭院",
  "鐘樓庭院",
  "The Courtyard",
  "時計塔の中庭",
  "시계탑 안뜰"
 ],
 "hall": [
  "大礼堂",
  "大餐廳",
  "The Great Hall",
  "大広間",
  "연회장"
 ],
 "library": [
  "图书馆",
  "圖書館",
  "The Library",
  "図書館",
  "도서관"
 ],
 "potions": [
  "魔药教室",
  "魔藥學教室",
  "Potions Classroom",
  "魔法薬学の教室",
  "마법약 교실"
 ],
 "stairs": [
  "移动楼梯",
  "移動樓梯",
  "The Grand Staircase",
  "動く大階段",
  "움직이는 계단"
 ],
 "astronomy": [
  "天文塔",
  "天文塔",
  "The Astronomy Tower",
  "天文台の塔",
  "천문탑"
 ],
 "shelter": [
  "棚屋接应处",
  "棚屋接應處",
  "The Shack Approach",
  "叫びの屋敷・救護路",
  "오두막 구조 통로"
 ],
 "study": [
  "晨光中的研究室",
  "晨光中的研究室",
  "The Morning Study",
  "朝の研究室",
  "아침빛 연구실"
 ],
 "moveStairs": [
  "让楼梯转向",
  "讓樓梯轉向",
  "Turn the staircase",
  "階段を動かす",
  "계단 돌리기"
 ],
 "stairsMoving": [
  "楼梯正在接拢…",
  "樓梯正在接攏…",
  "The stairs are turning…",
  "階段がつながるまで…",
  "계단이 이어지는 중…"
 ],
 "stairsMessage": [
  "石阶正在缓缓转向。留在阶梯上，等它与回廊接拢。",
  "石階正在緩緩轉向。留在階梯上，等它與迴廊接攏。",
  "Stay on the slowly turning stairs until they meet the landing.",
  "ゆっくり動く階段の上で、踊り場につながるのを待とう。",
  "천천히 움직이는 계단 위에서 복도에 닿을 때까지 기다리세요."
 ],
 "toTower": [
  "前往天文塔",
  "前往天文塔",
  "To the Astronomy Tower",
  "天文台の塔へ",
  "천문탑으로"
 ],
 "toCourtyard": [
  "回到庭院",
  "回到庭院",
  "Back to the courtyard",
  "中庭へ戻る",
  "안뜰로 돌아가기"
 ],
 "parallel": [
  "如果这一次 · 平行故事",
  "如果這一次 · 平行故事",
  "If, this time · An alternate story",
  "もし、今度こそ · もう一つの物語",
  "만약 이번에는 · 또 다른 이야기"
 ],
 "returnStory": [
  "回到战后城堡",
  "回到戰後城堡",
  "Return to the post-war castle",
  "戦後の城へ戻る",
  "전쟁이 끝난 성으로"
 ],
 "resumeChapter": [
  "继续平行章节",
  "繼續平行章節",
  "Resume the alternate chapter",
  "もう一つの物語を続ける",
  "또 다른 이야기 이어가기"
 ],
 "returnStudy": [
  "再访晨光研究室",
  "再訪晨光研究室",
  "Revisit the morning study",
  "朝の研究室を再訪する",
  "아침빛 연구실 다시 방문"
 ],
 "fanwork": [
  "非官方同人游戏 · 原创分支剧情",
  "非官方同人遊戲 · 原創分支劇情",
  "Unofficial fan game · Original alternate story",
  "非公式ファンゲーム · オリジナル分岐物語",
  "비공식 팬 게임 · 창작 분기 이야기"
 ],
 "errorWebgl": [
  "暂时无法开启三维场景，请使用支持 WebGL 2 的浏览器。",
  "暫時無法開啟三維場景，請使用支援 WebGL 2 的瀏覽器。",
  "The 3D scene could not start. Use a browser that supports WebGL 2.",
  "3D画面を開始できません。WebGL 2対応ブラウザをご利用ください。",
  "3D 장면을 시작할 수 없어요. WebGL 2 지원 브라우저를 사용해 주세요."
 ],
 "errorLoad": [
  "部分资源未能载入，请检查网络后重新打开。",
  "部分資源未能載入，請檢查網路後重新開啟。",
  "Some files could not load. Check your connection and reload.",
  "一部のデータを読み込めません。接続を確認して再読み込みしてください。",
  "일부 자료를 불러오지 못했어요. 연결을 확인한 후 다시 열어 주세요."
 ],
 "reload": [
  "重新载入",
  "重新載入",
  "Reload",
  "再読み込み",
  "다시 불러오기"
 ],
 "canvasLabel": [
  "可交互的三维城堡，拖动环视",
  "可互動的三維城堡，拖曳環視",
  "Interactive 3D castle. Drag to look around.",
  "操作できる3Dの城。ドラッグで見回せます。",
  "조작 가능한 3D 성. 드래그로 둘러보세요."
 ],
 "select": [
  "选择",
  "選擇",
  "Choose",
  "選ぶ",
  "선택"
 ],
 "discovered": [
  "已发现",
  "已發現",
  "Discovered",
  "見つけたもの",
  "발견함"
 ],
 "notFound": [
  "还有秘密在等你",
  "還有祕密在等你",
  "There is more to find",
  "まだ、見つかっていないものがある",
  "아직 발견할 이야기가 있어요"
 ],
 "later": [
  "稍后再来",
  "稍後再來",
  "Come back later",
  "あとで訪れる",
  "나중에 다시 오기"
 ],
 "noAI": [
  "完整故事无需生成或付费。",
  "完整故事無須生成或付費。",
  "The complete story needs no paid generation.",
  "物語を遊ぶための有料生成はありません。",
  "이야기 전체에 유료 생성이 필요하지 않아요."
 ],
 "conflict": [
  "另一标签页有更新的进度。重新载入后再继续，或先导出此页存档。",
  "另一分頁有較新的進度。重新載入後再繼續，或先匯出此頁存檔。",
  "Another tab has newer progress. Reload to continue, or export this tab’s save first.",
  "別のタブに新しい進行状況があります。再読み込みするか、先にこのタブのセーブを書き出してください。",
  "다른 탭에 더 최근 진행 상황이 있어요. 다시 불러오거나 이 탭의 저장 파일을 먼저 내보내 주세요."
 ],
 "houseAid": [
  "学院带来的帮助",
  "學院帶來的幫助",
  "Help from your house",
  "寮から届いた助け",
  "기숙사에서 건넨 도움"
 ],
 "aid.gryffindor": [
  "同院前辈的护送经验：先把最不稳的一处支住。你已替接应者稳住上方的木板。",
  "同寮學長姐的護送經驗：先支住最不穩的一處。你已替接應者穩住上方木板。",
  "An older housemate’s escorting advice: secure the least stable point first. The overhead boards are now braced.",
  "寮の先輩の護送の知恵。不安定な場所を最初に支える。上の板を固定できた。",
  "기숙사 선배의 호위 조언. 가장 불안한 곳부터 받친다. 위쪽 판자를 고정했다."
 ],
 "aid.ravenclaw": [
  "图书馆同伴帮你找到借阅索引。17 号登记的日期和笔迹都可以核对，可靠证据已标出。",
  "圖書館的同伴幫你找到借閱索引。17 號登記的日期與筆跡皆能核對，可靠證據已標出。",
  "A library companion finds the borrowing index. Register 17 has a verifiable date and handwriting. The reliable source is marked.",
  "図書館の仲間が貸出索引を見つけた。記録17の日付と筆跡は照合できる。確かな資料に印がついた。",
  "도서관 친구가 대출 색인을 찾았다. 기록 17의 날짜와 필체를 확인할 수 있다. 믿을 만한 자료를 표시했다."
 ],
 "aid.hufflepuff": [
  "在温室照料幼苗时学到的细心派上了用场：先放好柔软的垫层。亚麻布已经铺稳。",
  "在溫室照料幼苗時學到的細心派上用場：先放好柔軟墊層。亞麻布已鋪穩。",
  "Care learned with greenhouse seedlings proves useful: start with a soft foundation. The linen is laid in place.",
  "温室で苗を世話した経験が役立つ。まず柔らかい土台から。リネンを敷けた。",
  "온실에서 묘목을 돌보며 배운 세심함이 도움이 된다. 부드러운 바탕부터 마련한다. 리넨을 깔았다."
 ],
 "aid.slytherin": [
  "同院伙伴提前整理了接应路线。月纹已朝北，星纹已朝西；只需完成最后一层校准。",
  "同寮夥伴事先整理了接應路線。月紋已朝北，星紋已朝西；只需校準最後一層。",
  "A housemate mapped the rendezvous in advance. Moon north and star west are set. One final bearing remains.",
  "寮の仲間が先に救護経路を調べてくれた。月は北、星は西に調整済み。最後の方角を合わせよう。",
  "기숙사 친구가 미리 접선 경로를 정리했다. 달은 북쪽, 별은 서쪽으로 맞췄다. 마지막 방향만 남았다."
 ],
 "music": [
  "背景音乐",
  "背景音樂",
  "Background music",
  "背景音楽",
  "배경 음악"
 ],
 "musicPlay": [
  "播放背景音乐",
  "播放背景音樂",
  "Play background music",
  "背景音楽を再生",
  "배경 음악 재생"
 ],
 "musicMute": [
  "静音背景音乐",
  "靜音背景音樂",
  "Mute background music",
  "背景音楽をミュート",
  "배경 음악 음소거"
 ],
 "musicDesc": [
  "Hedwig’s Theme · John Williams",
  "Hedwig’s Theme · John Williams",
  "Hedwig’s Theme · John Williams",
  "Hedwig’s Theme · John Williams",
  "Hedwig’s Theme · John Williams"
 ],
 "musicRetry": [
  "音乐未能播放，请再次点击播放。",
  "音樂未能播放，請再次點擊播放。",
  "Music could not start. Tap play to try again.",
  "音楽を再生できませんでした。もう一度再生を押してください。",
  "음악을 재생하지 못했어요. 재생을 다시 눌러 주세요."
 ],
 "openEnvelope": [
  "拆开信封",
  "拆開信封",
  "Break the seal",
  "封を開く",
  "봉인 열기"
 ],
 "envelopeCaption": [
  "信封没有署名。蜡封还好好地粘着。",
  "信封沒有署名。蠟封還好好地黏著。",
  "There is no name on the envelope. The seal is still intact.",
  "封筒に宛名はない。封蝋はまだ剥がされていない。",
  "봉투에는 이름이 없다. 밀랍 봉인은 그대로 붙어 있다."
 ],
 "letterSignature": [
  "米勒娃·麦格\n霍格沃茨校长",
  "米奈娃·麥\n霍格華茲校長",
  "Minerva McGonagall\nHeadmistress, Hogwarts",
  "ミネルバ・マクゴナガル\nホグワーツ校長",
  "미네르바 맥고나걸\n호그와트 교장"
 ],
 "hatSpeaker": [
  "分院帽",
  "分類帽",
  "The Sorting Hat",
  "組分け帽子",
  "기숙사 배정 모자"
 ],
 "hatVoice": [
  "听分院帽说话",
  "聽分類帽說話",
  "Listen to the Hat",
  "帽子の声を聞く",
  "모자 목소리 듣기"
 ],
 "hatVoiceUnavailable": [
  "此设备暂无对应的本地语音，可以继续阅读对白。",
  "此裝置暫無對應的本機語音，可以繼續閱讀對白。",
  "No matching local voice is available. The dialogue is still here to read.",
  "対応する端末内の音声がありません。会話は文字で読めます。",
  "이 언어의 기기 내 음성이 없어요. 대사는 글로 계속 읽을 수 있어요."
 ],
 "sort.finished": [
  "“去吧，别让麦格教授等太久。她今晚要操心的事可不少。”",
  "「去吧，別讓麥教授等太久。她今晚要操心的事可不少。」",
  "“Off you go. Do not keep Professor McGonagall waiting. She has quite enough to do tonight.”",
  "「さあ行きなさい。マクゴナガル先生を待たせてはいかん。今夜はずいぶん忙しそうだからな」",
  "“이제 가 보렴. 맥고나걸 교수님을 너무 오래 기다리게 하지 말고. 오늘 밤은 신경 쓰실 일이 많으니까.”"
 ],
 "star": [
  "星纹",
  "星紋",
  "Star",
  "星",
  "별"
 ],
 "sun": [
  "日纹",
  "日紋",
  "Sun",
  "太陽",
  "해"
 ],
 "east": [
  "东",
  "東",
  "East",
  "東",
  "동"
 ],
 "south": [
  "南",
  "南",
  "South",
  "南",
  "남"
 ],
 "west": [
  "西",
  "西",
  "West",
  "西",
  "서"
 ],
 "flameMark": [
  "焰",
  "焰",
  "Flame",
  "炎",
  "불꽃"
 ],
 "vial": [
  "封口的玻璃瓶",
  "封口的玻璃瓶",
  "Sealed glass vial",
  "栓をしたガラス瓶",
  "밀봉한 유리병"
 ],
 "straps": [
  "担架固定带",
  "擔架固定帶",
  "Stretcher straps",
  "担架の固定帯",
  "들것 고정 끈"
 ],
 "leafMeasure": [
  "银叶汁",
  "銀葉汁",
  "Silverleaf",
  "銀葉液",
  "은빛 잎즙"
 ],
 "heatMeasure": [
  "火力",
  "火力",
  "Heat",
  "火力",
  "화력"
 ]
};
COPY.chapterDone=['本章已完成','本章已完成','Chapter complete','この章は完了しました','이 장을 마쳤어요'];
Object.assign(COPY,STORY_COPY);
export function t(locale:Locale,key:string):string{return COPY[key]?.[LOCALES.indexOf(locale)]??`[${key}]`;}
