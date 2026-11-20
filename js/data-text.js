/* 밤의 목장 — js/data-text.js : 묵상글(REFLECTIONS, 키=감정_주제) · 응원글(ENCS, 키=감정_필요) 한국어/영어
   (일반 스크립트. index.html 맨 아래에 적힌 순서대로 불러옵니다) */

/* 묵상 (30개) */
const REFLECTIONS = {
    '감사_일':[
        '오늘 일에서 감사함을 발견하셨군요. 그 감사는 하나님께서 당신의 수고를 알고 계신다는 조용한 증거이에요. 오늘 하신 모든 일이 헛되지 않았어요.',
        '직장에서, 혹은 오늘의 과업 속에서 감사한 순간이 있으셨군요. 일상의 작은 감사가 쌓여 믿음이 돼요. 하나님은 당신의 하루하루를 기억하세요.',
        '오늘 하신 일 가운데 하나님의 손길이 있었어요. 그 손길을 알아채신 것 자체가 은혜이에요. 오늘의 감사를 내일도 기억하세요.',
        '일 속에서 감사를 찾는 것은 쉽지 않아요. 그런데 오늘 당신은 그것을 해내셨어요. 그 마음이 하나님을 기쁘게 해요.',
        '바쁜 하루였겠지만, 그 가운데서도 감사한 마음이 드셨군요. 하나님은 당신의 모든 수고를 보고 계세요. 오늘도 충분히 잘 하셨어요.',
        '오늘의 일이 버겁더라도 감사한 마음이 생겼다는 것은 하나님의 은혜이에요. 그 감사가 내일의 힘이 돼요.'
    ],
    '감사_가족':[
        '가족 안에서 감사를 느끼셨군요. 가족은 하나님이 주신 가장 가까운 선물이에요. 오늘 그 선물을 알아보신 것, 참 복된 하루였어요.',
        '가족과 함께하는 시간이 감사하게 느껴졌군요. 그 따뜻함은 하나님이 주신 것이에요. 그 소중함을 오래 기억하세요.',
        '가족을 통해 하나님의 사랑을 느끼셨군요. 가족은 하나님이 우리에게 주신 가장 가까운 공동체이에요. 오늘 그것을 깨달으셨으니 참 복된 날이에요.',
        '가족의 존재 자체가 감사하다고 느끼셨나요? 그 마음이 얼마나 귀한지 모릅니다. 하나님도 그 감사를 기뻐하세요.',
        '오늘 가족 덕분에 힘을 얻으셨군요. 하나님은 때로 가족을 통해 우리를 위로하세요. 그 선물에 감사드리세요.',
        '가족과의 작은 순간 속에서 감사를 발견하셨군요. 그 소소한 감사들이 쌓여 인생의 아름다운 그림이 돼요.'
    ],
    '감사_공부':[
        '배움 속에서 감사를 찾으셨군요. 지식을 얻을 기회, 깨달음을 주신 하나님께 오늘도 감사드립니다. 공부하는 것 자체가 은혜이에요.',
        '오늘 배운 것들이 감사하게 느껴졌군요. 배움의 기회는 하나님의 선물이에요. 그 지식이 하나님의 영광을 위해 쓰이기를 기도드립니다.',
        '공부 가운데 감사함을 느끼셨군요. 깨달음의 순간마다 하나님이 함께 계세요. 배우는 과정 자체를 즐기실 수 있기를 바라요.',
        '오늘의 공부가 의미 있게 느껴지셨군요. 그 열심을 하나님이 보고 계세요. 지식은 겸손히 사용될 때 가장 빛납니다.',
        '배움 속에서 하나님의 섭리를 발견하셨군요. 모든 지식의 근원은 하나님께 있어요. 오늘의 배움이 내일의 지혜가 돼요.',
        '공부하면서 감사한 마음이 드셨군요. 배울 수 있는 것, 생각할 수 있는 것 모두 하나님의 선물이에요. 그 감사를 품고 오늘을 마무리하세요.'
    ],
    '감사_사람':[
        '오늘 사람을 통해 감사를 느끼셨군요. 누군가가 당신의 하루를 따뜻하게 해주었나요? 그 사람도 하나님이 보내주신 사람일지 모릅니다.',
        '오늘 누군가가 당신의 하루를 빛나게 해주었군요. 하나님은 종종 사람을 통해 우리에게 사랑을 전하세요. 그 만남에 감사하세요.',
        '사람 덕분에 감사한 하루가 되었군요. 우리는 서로를 통해 하나님의 은혜를 경험해요. 당신도 누군가에게 그런 존재일 것이에요.',
        '오늘 만난 누군가가 마음에 따뜻함을 주었군요. 그 관계 안에서 하나님의 선하심을 보셨어요. 그 인연을 소중히 여기세요.',
        '사람을 통해 감사를 경험하셨군요. 하나님은 우리의 삶에 좋은 사람들을 보내주세요. 오늘 그 사람이 당신 곁에 있었어요.',
        '누군가와의 교류가 오늘 하루를 감사하게 만들었군요. 그 관계가 하나님의 선물임을 기억하세요.'
    ],
    '감사_모름':[
        '무엇인지 모르지만 감사한 마음이 드셨군요. 그 이름 모를 감사도 하나님 앞에서는 아름다운 기도예요. 그냥 감사한 마음, 그것으로 충분해요.',
        '이유는 모르겠지만 감사한 마음이 드셨군요. 그 감사는 하나님이 당신의 마음에 심어주신 씨앗이에요. 그 마음을 오래 품으세요.',
        '무언가 막연하지만 감사한 하루였군요. 때로는 설명할 수 없는 은혜가 있어요. 그 모든 것이 하나님의 선물이에요.',
        '이유를 정확히 모르지만 감사함이 느껴지셨군요. 그것이 바로 하나님의 임재를 느끼는 순간이에요. 그 감사를 하나님께 올려드리세요.',
        '오늘 특별한 이유 없이도 감사한 마음이 드셨군요. 그런 날이 있어요. 하나님의 은혜는 때로 설명할 수 없는 방식으로 옵니다.',
        '막연한 감사도 진짜 감사이에요. 그 마음이 하나님 앞에서는 아름다운 찬양이 돼요. 오늘 하루 감사히 마무리하세요.'
    ],
    '평안_일':[
        '일 가운데 평안함을 느끼셨군요. 바쁜 하루였을 텐데 그 가운데 평안이 있었다면, 그것은 하나님의 선물이에요. 오늘 하루 잘 지키신 당신이에요.',
        '분주한 일상 속에서 평안을 경험하셨군요. 그 평안은 세상이 줄 수 없는 것이에요. 하나님이 당신과 함께하셨기 때문이에요.',
        '오늘 일하는 가운데 마음이 평안했군요. 흔들리지 않는 평안은 하나님 안에 머물 때 옵니다. 그 안에 계속 거하세요.',
        '일의 무게 속에서도 평안이 찾아오셨군요. 그것은 하나님이 당신 곁에 계신다는 신호이에요. 오늘 하루도 잘 마치셨어요.',
        '업무 가운데 흔들리지 않는 마음이 있으셨군요. 그 평안이 하나님의 선물임을 기억하시고, 내일도 그 평안으로 나아가세요.',
        '오늘 일 속에서 고요함을 경험하셨군요. 그 고요함이 하나님과의 동행에서 온 것이에요. 내일도 그 동행을 이어가세요.'
    ],
    '평안_가족':[
        '가족과 함께하는 평안한 하루였군요. 집 안에 평화가 있는 것, 그것이 얼마나 큰 복인지 모릅니다. 오늘 그 평안을 느끼셨으니 참 감사한 날이에요.',
        '가족과의 시간이 평안하게 느껴지셨군요. 그 평화는 하나님이 주시는 것이에요. 가정 안의 평화가 세상의 평화로 이어집니다.',
        '가족과 함께하는 자리가 편안하고 안전하게 느껴지셨군요. 그 쉼터가 얼마나 귀한지 모릅니다. 하나님이 주신 선물이에요.',
        '가족과 함께하는 시간이 마음을 채워주었군요. 그 평안이 하나님의 사랑을 담고 있어요. 오늘 같은 날이 더 많아지기를 기도드립니다.',
        '가족 덕분에 마음이 평온해지셨군요. 사랑하는 사람들과의 시간은 하나님의 귀한 선물이에요. 오늘 하루 감사히 여기세요.',
        '집에서의 평안이 마음을 채워주었군요. 그 평안은 하나님께서 허락하신 것이에요. 오늘의 고요함을 품고 쉬세요.'
    ],
    '평안_공부':[
        '공부하는 가운데 평안함이 있었군요. 배움의 과정에 쫓기지 않고 평안히 임할 수 있었던 것, 그것도 주님이 지켜주신 덕분이에요.',
        '공부하면서 마음이 고요했군요. 배움의 여정이 쫓기는 것이 아니라 동행하는 느낌이었다면, 그것이 하나님이 함께하신 증거이에요.',
        '오늘 공부가 부담스럽지 않고 평안하게 느껴지셨군요. 그 마음의 여유도 하나님이 주신 것이에요. 내일도 그 평안으로 임하세요.',
        '배움 속에서 흔들리지 않는 마음이 있었군요. 그 안정감은 하나님이 주시는 선물이에요. 그 평안으로 더 깊이 배워가세요.',
        '공부하는 시간이 평온하게 흘러갔군요. 그 고요한 집중 속에도 하나님이 함께하셨어요. 오늘의 평안한 배움에 감사하세요.',
        '오늘 공부가 마음의 부담 없이 이루어졌군요. 그것이 얼마나 큰 은혜인지 모릅니다. 하나님이 당신의 마음을 지켜주셨어요.'
    ],
    '평안_사람':[
        '사람들과의 관계에서 평안함을 느끼셨군요. 사람과의 관계에서 평화를 느끼는 것은 쉽지 않은 일이에요. 오늘 그런 하루였다면 참 감사한 날이에요.',
        '오늘 사람들과의 만남이 편안하게 느껴지셨군요. 관계 안에서 평화를 경험하는 것은 하나님의 은혜이에요. 그 관계를 소중히 여기세요.',
        '누군가와의 관계가 오늘 마음 편하게 느껴지셨군요. 그 평화가 하나님이 주신 것임을 기억하세요. 좋은 관계는 하나님의 선물이에요.',
        '사람들 사이에서 마음이 평안했군요. 모든 좋은 관계는 하나님에게서 옵니다. 오늘 그 평화를 경험하셨으니 감사한 하루이에요.',
        '오늘 만난 사람들과의 시간이 평온했군요. 그 평화가 하나님의 임재를 보여줍니다. 그 관계를 하나님 안에서 이어가세요.',
        '관계 속에서 찾아온 평안이 오늘 하루를 특별하게 만들었군요. 하나님은 때로 사람을 통해 우리에게 평화를 주세요.'
    ],
    '평안_모름':[
        '무엇인지 모르지만 오늘 하루가 평안했군요. 그 이름 모를 평안도 주님의 선물이에요. 세상이 줄 수 없는 평안을 오늘 받으셨어요.',
        '이유는 모르겠지만 오늘 마음이 고요하고 평안했군요. 그 평안은 하나님이 주시는 것이에요. 세상이 줄 수 없는 그 평안을 기억하세요.',
        '설명하기 어렵지만 오늘 평안함이 느껴지셨군요. 하나님의 임재는 때로 이렇게 조용히 옵니다. 그 평안 속에 하나님이 계세요.',
        '무언가 막연하지만 오늘 마음이 편안했군요. 그것이 바로 하나님의 평화이에요. 모든 이해를 초월하는 그 평안이 당신과 함께했어요.',
        '오늘 하루가 특별한 이유 없이 평안했군요. 그런 날이 있어요. 하나님이 조용히 당신의 마음을 지켜주신 날이에요.',
        '이름 붙이기 어려운 평안이 오늘 당신과 함께했군요. 그것이 바로 하나님의 선물이에요. 그 평안을 안고 오늘 밤 쉬세요.'
    ],
    '걱정_일':[
        '일로 인해 걱정이 드셨군요. 해결되지 않은 것들, 내일의 일들이 마음을 무겁게 했나요? 모든 답을 오늘 찾지 못해도 괜찮아요. 오늘 할 수 있는 것을 하셨으면 충분해요.',
        '업무에 대한 걱정으로 마음이 무거우셨군요. 하나님은 당신이 짊어진 짐을 알고 계세요. 그 짐을 잠시 하나님께 내려놓으세요.',
        '오늘 일이 마음에 걸리셨군요. 걱정은 우리가 무언가를 중요하게 여긴다는 뜻이기도 해요. 그 마음을 하나님께 맡기고 오늘 밤은 쉬세요.',
        '일 때문에 마음이 무거우셨군요. 내일의 걱정을 오늘 다 안고 갈 필요는 없어요. 하나님이 내일도 함께하실 것이에요.',
        '직장이나 할 일들에 대한 걱정이 있으셨군요. 그 걱정을 하나님 앞에 내려놓으세요. 그분이 길을 만드실 것이에요.',
        '오늘 일로 인한 걱정이 마음을 가득 채웠군요. 하지만 하나님은 그 모든 상황을 아세요. 당신의 수고를 하나님이 보고 계세요.'
    ],
    '걱정_가족':[
        '가족 때문에 걱정이 드셨군요. 사랑하기 때문에 걱정이 되는 것이에요. 그 마음을 하나님 앞에 내려놓으세요. 당신이 걱정하는 그 사람도 하나님이 보고 계세요.',
        '사랑하는 가족이 마음에 걸리셨군요. 그 걱정이 얼마나 크든, 하나님은 그들을 당신보다 더 깊이 아세요. 그분께 맡기세요.',
        '가족 걱정이 하루를 무겁게 했군요. 가족을 걱정하는 마음 자체가 사랑의 표현이에요. 그 사랑을 기도로 하나님께 드리세요.',
        '오늘 가족으로 인해 마음이 편치 않으셨군요. 하나님은 당신의 가족을 손 안에 쥐고 계세요. 그 사실이 오늘 밤 당신을 위로하기를 바라요.',
        '가족에 대한 걱정이 마음을 채웠군요. 그 걱정을 기도로 바꾸세요. 하나님이 가장 좋은 방법으로 역사하실 것이에요.',
        '가족 때문에 마음이 어수선하셨군요. 사랑하는 마음에서 오는 걱정은 아름다운 것이에요. 그 마음을 하나님께 드리고 쉬세요.'
    ],
    '걱정_공부':[
        '공부에 대한 걱정이 있으셨군요. 잘 해낼 수 있을지, 따라갈 수 있을지 걱정이 드셨나요? 하나님은 당신이 걷는 길을 알고 계세요. 결과보다 당신의 걸음을 보고 계세요.',
        '공부가 잘 될지 걱정이 드셨군요. 하나님은 당신의 노력을 보고 계세요. 결과는 그분께 맡기고, 오늘 할 수 있는 것에 최선을 다하세요.',
        '시험이나 과제에 대한 걱정이 마음을 무겁게 했군요. 지혜를 구하는 자에게 하나님은 풍성히 주신다고 하셨어요. 그분께 지혜를 구하세요.',
        '공부하는 것이 벅차게 느껴지셨군요. 배움의 길은 쉽지 않지만, 하나님이 당신의 길을 인도하세요. 포기하지 마세요.',
        '학업에 대한 걱정으로 하루가 무거웠군요. 하나님은 당신이 감당할 수 없는 것을 허락하지 않으세요. 그분을 믿으세요.',
        '공부에 대한 불안이 마음을 채웠군요. 그 걱정을 하나님 앞에 내려놓으세요. 그분이 필요한 지혜와 집중력을 주실 것이에요.'
    ],
    '걱정_사람':[
        '누군가로 인해 걱정이 드셨군요. 그 사람의 말이나 행동이 마음에 걸리셨나요? 사람 사이의 일은 때로 오래 걸립니다. 하지만 하나님은 그 관계도 붙들고 계세요.',
        '누군가 때문에 마음이 무거우셨군요. 사람 사이의 문제는 복잡하지만, 하나님은 모든 관계를 주관하세요. 그분께 맡기세요.',
        '어떤 사람 때문에 걱정이 드셨군요. 그 사람을 위해 기도해주세요. 당신의 기도가 그를 위한 가장 큰 선물이 될 수 있어요.',
        '관계에서 오는 걱정으로 마음이 어수선하셨군요. 하나님은 그 관계도 알고 계세요. 결과를 그분께 맡기고 오늘 밤은 쉬세요.',
        '누군가가 마음에 걸려 하루 종일 신경이 쓰이셨군요. 그 걱정을 기도로 드리세요. 하나님이 가장 좋은 방법으로 해결하실 것이에요.',
        '사람 때문에 생긴 걱정이 하루를 무겁게 만들었군요. 그 관계를 하나님의 손에 맡기세요. 그분이 당신과 그 사람 모두를 돌보세요.'
    ],
    '걱정_모름':[
        '무엇인지 모르지만 마음에 걱정이 있으셨군요. 때로는 무엇이 걱정인지조차 모를 때가 있어요. 그런 마음도 하나님 앞에 그대로 가져가셔도 돼요.',
        '이유를 정확히 모르겠지만 뭔가 마음이 무겁고 불안하셨군요. 설명할 수 없는 걱정도 하나님은 아세요. 그 마음 그대로 그분께 드리세요.',
        '막연한 불안감이 하루를 감싸고 있었군요. 그 감정을 억누르지 마세요. 하나님은 당신의 모든 감정을 받아주세요.',
        '무언가 마음에 걸리는 것이 있으셨지만 정확히 뭔지 모르겠군요. 그럴 때가 있어요. 그 마음을 그대로 하나님께 가져가세요.',
        '이름 모를 불안이 오늘 하루 함께했군요. 하나님은 당신이 느끼는 모든 것을 아세요. 말로 표현하지 못해도 괜찮아요.',
        '뚜렷한 이유는 없지만 마음이 편치 않으셨군요. 그런 날이 있어요. 하나님 앞에 그 마음을 내려놓고 오늘 밤 쉬세요.'
    ],
    '지침_일':[
        '일로 지치셨군요. 오늘 하루 정말 수고 많으셨어요. 지친 것은 그만큼 열심히 살았다는 뜻이에요. 이제 쉬셔도 돼요.',
        '오늘 일 때문에 많이 소진되셨군요. 최선을 다한 당신을 하나님이 보고 계세요. 이제 그 수고를 내려놓고 쉬세요.',
        '직장이나 할 일들로 오늘 많이 지치셨군요. 그 피곤함이 하루를 온전히 살았다는 증거이에요. 충분히 쉬어도 돼요.',
        '일 때문에 몸과 마음이 지쳤군요. 하나님은 지친 자에게 새 힘을 주세요. 오늘 밤 푹 쉬시면 내일 다시 힘이 납니다.',
        '오늘 업무가 당신을 많이 힘들게 했군요. 그 힘듦을 하나님이 알고 계세요. 수고한 자에게 쉼을 주신다는 약속을 기억하세요.',
        '일로 인한 피곤함이 온몸에 쌓였군요. 그 수고를 하나님이 기억하세요. 오늘은 충분히 쉬는 것도 하나님의 뜻이에요.'
    ],
    '지침_가족':[
        '가족을 위해 애쓰다 지치셨군요. 가족을 위한 수고는 눈에 띄지 않아도 하나님은 보고 계세요. 오늘도 충분히 잘 하셨어요.',
        '가족을 위해 자신을 쏟아부으셨군요. 그 헌신이 얼마나 귀한지 하나님은 아세요. 당신의 사랑이 가족에게 전해집니다.',
        '사랑하는 가족을 위해 오늘도 최선을 다하다 지치셨군요. 그 사랑이 하나님 앞에서 아름답아요. 이제 당신도 쉬어야 할 시간이에요.',
        '가족을 돌보느라 지치셨군요. 눈에 띄지 않는 헌신도 하나님은 보세요. 당신의 수고가 헛되지 않아요.',
        '가족을 위한 수고가 오늘 많이 쌓였군요. 그 사랑의 수고를 하나님이 기억하세요. 오늘 밤은 당신도 쉬세요.',
        '가족 곁에서 애쓰다 몸과 마음이 지쳤군요. 그 사랑의 헌신을 하나님이 다 알고 계세요. 이제 하나님께 맡기고 쉬세요.'
    ],
    '지침_공부':[
        '공부하다 지치셨군요. 배움의 길은 결코 쉽지 않아요. 하지만 지금 하고 계신 것이 헛되지 않아요. 하나님은 당신의 성실함을 알고 계세요.',
        '공부 때문에 오늘 많이 소진되셨군요. 그 노력이 결코 헛되지 않아요. 하나님은 성실한 자에게 지혜를 주세요.',
        '열심히 공부하다 지치셨군요. 그 열심이 귀해요. 지금 쉬는 것도 내일의 공부를 위한 준비이에요.',
        '배움의 과정에서 지침을 느끼셨군요. 쉬지 않고 달려온 당신, 정말 수고 많으셨어요. 잠깐 멈추어도 괜찮아요.',
        '공부로 인한 피곤함이 쌓였군요. 하나님은 당신의 노력을 보고 계세요. 충분히 쉬고 내일 다시 시작하세요.',
        '오늘 공부에 많은 에너지를 쏟으셨군요. 그 성실함이 하나님 앞에서 아름답아요. 이제 쉬면서 힘을 충전하세요.'
    ],
    '지침_사람':[
        '사람들 사이에서 지치셨군요. 많은 사람을 만나고 돌보는 일은 정말 힘이 많이 드는 일이에요. 오늘은 하나님 앞에 잠잠히 쉬셔도 돼요.',
        '사람들과 함께하는 것이 오늘은 많이 힘드셨군요. 사람을 사랑하는 것은 에너지가 많이 필요한 일이에요. 오늘 밤은 혼자 조용히 쉬세요.',
        '여러 사람들 사이에서 에너지가 많이 소진되셨군요. 그 관계들 안에서 하나님이 함께하셨어요. 이제 하나님 앞에서 쉬어가세요.',
        '사람으로 인해 지치셨군요. 관계 속에서 최선을 다한 당신을 하나님이 아세요. 오늘 밤은 하나님 앞에 조용히 쉬세요.',
        '많은 관계와 교류 속에서 탈진하셨군요. 그 수고가 귀해요. 혼자만의 시간을 가지며 회복하세요.',
        '사람들 사이에서 소진된 에너지를 충전해야 할 시간이군요. 하나님 앞에서 조용히 쉬는 것이 가장 좋은 회복이에요.'
    ],
    '지침_모름':[
        '무엇인지 모르지만 그냥 지치셨군요. 그럴 때가 있어요. 무언가가 이유여서가 아니라 그냥 지치는 날. 오늘이 그런 날이었군요. 그래도 괜찮아요.',
        '이유를 모르겠지만 그냥 몸과 마음이 지쳤군요. 그런 날이 있어요. 특별한 이유 없이도 지칠 수 있어요. 오늘은 그냥 쉬어도 돼요.',
        '뚜렷한 원인은 없지만 오늘 많이 지치셨군요. 그 피곤함도 하나님이 아세요. 설명하지 않아도 돼요. 그냥 쉬세요.',
        '이유 없이 지치는 날이 있어요. 오늘이 그런 날이었군요. 그것도 괜찮아요. 하나님은 지친 당신의 모습도 사랑하세요.',
        '왜인지 모르지만 오늘 많이 피곤하셨군요. 그 피곤함도 하나님 앞에 내려놓아도 돼요. 쉬는 것도 하나님의 뜻이에요.',
        '막연한 피곤함이 하루를 감쌌군요. 그런 날이 있어요. 내일은 다를 것이에요. 오늘 밤 충분히 쉬세요.'
    ],
    '아픔_일':[
        '일 때문에 마음이 아프셨군요. 인정받지 못하거나 힘든 상황을 겪으셨나요? 하나님은 당신의 상한 마음을 가장 가까이에서 보고 계세요.',
        '직장에서 상처를 받으셨군요. 인정받지 못하는 아픔, 부당한 상황의 억울함을 하나님이 알고 계세요. 그분이 위로하실 것이에요.',
        '일 때문에 마음이 많이 상하셨군요. 그 상처를 하나님 앞에 가져가세요. 상한 마음을 고치시는 분이 하나님이십니다.',
        '오늘 직장이나 일에서 힘든 일을 겪으셨군요. 그 아픔이 크지만, 하나님은 그 상황에서도 당신과 함께 계세요.',
        '업무로 인해 마음에 상처가 생겼군요. 그 아픔을 혼자 안고 있지 마세요. 하나님이 가장 가까이 계세요.',
        '일 속에서 겪은 아픔이 하루 종일 마음에 남아있군요. 하나님은 그 상처를 치유하시는 분이에요. 그분께 나아가세요.'
    ],
    '아픔_가족':[
        '가족 때문에 마음이 아프셨군요. 사랑하는 사람 때문에 아픈 것이 가장 깊은 아픔이에요. 그 마음을 하나님은 알고 계세요. 지금 이 상황도 하나님의 손 안에 있어요.',
        '사랑하는 가족으로 인해 마음이 아프셨군요. 가장 깊은 상처는 가장 가까운 사람에게서 옵니다. 하나님이 그 아픔을 알고 계세요.',
        '가족과의 관계에서 상처를 받으셨군요. 그 아픔이 얼마나 크든, 하나님은 그 관계도 붙들고 계세요. 그분께 맡기세요.',
        '가족 때문에 생긴 아픔이 마음에 가득하셨군요. 사랑하기 때문에 더 아픈 것이에요. 하나님이 그 마음을 위로하실 것이에요.',
        '가족으로 인한 상처가 오늘 하루를 무겁게 만들었군요. 그 관계를 하나님의 손에 드리세요. 그분이 치유하실 것이에요.',
        '가족과의 갈등이나 상처가 마음을 아프게 했군요. 하나님은 그 관계도 사랑하세요. 그분이 회복시켜 주실 것이에요.'
    ],
    '아픔_공부':[
        '공부하면서 마음이 아프셨군요. 따라가기 힘들거나 결과가 기대에 못 미쳤나요? 오늘의 아픔은 오늘 밤 지나갑니다. 아침에는 새로운 빛이 옵니다.',
        '공부에서 오는 상처가 있으셨군요. 따라가지 못하는 것 같은 느낌, 결과가 좋지 않은 실망감을 하나님이 아세요. 오늘만으로 당신의 가치를 판단하지 마세요.',
        '학업에서 아픔을 겪으셨군요. 그 좌절감과 실망이 얼마나 크든, 하나님은 당신의 노력을 보고 계세요. 오늘의 결과가 전부가 아닙니다.',
        '공부하다 마음이 많이 상하셨군요. 기대에 못 미치는 것 같은 느낌이 드셨나요? 하나님은 결과가 아니라 당신의 마음을 보세요.',
        '시험이나 과제 결과로 마음이 아프셨군요. 한 번의 결과가 당신을 정의하지 않아요. 하나님이 당신을 보시는 눈은 다릅니다.',
        '공부하면서 스스로가 부족하게 느껴지셨군요. 그 아픔을 하나님께 가져가세요. 그분은 당신의 가능성을 보고 계세요.'
    ],
    '아픔_사람':[
        '누군가로 인해 마음이 아프셨군요. 말 한마디, 표정 하나가 하루 종일 마음에 걸리셨나요? 하나님은 당신의 그 아픔을 위로하시는 분이에요.',
        '누군가의 말이나 행동이 마음에 상처를 주었군요. 그 아픔이 얼마나 크든, 하나님은 당신의 상한 마음 곁에 계세요.',
        '사람에게 상처를 받으셨군요. 그 아픔을 혼자 안고 있지 마세요. 하나님이 그 상처를 치유하실 것이에요.',
        '누군가로 인해 생긴 아픔이 하루를 무겁게 만들었군요. 그 관계를 하나님께 드리세요. 그분이 가장 좋은 방법으로 치유하실 것이에요.',
        '오늘 사람에게 받은 상처가 마음에 남아있군요. 그 아픔을 인정하고 하나님께 가져가세요. 그분이 위로하실 것이에요.',
        '누군가의 말이나 태도가 마음을 아프게 했군요. 하나님은 그 상처를 아세요. 그분 앞에 그 마음을 내려놓으세요.'
    ],
    '아픔_모름':[
        '무엇인지 모르지만 마음이 아프셨군요. 때로는 말로 설명할 수 없는 슬픔이 찾아옵니다. 그런 날이 있어요. 당신만 그런 것이 아닙니다.',
        '이유를 모르겠지만 마음이 많이 아프셨군요. 설명할 수 없는 아픔도 하나님은 아세요. 그 마음 그대로 그분께 가져가세요.',
        '뚜렷한 원인 없이 마음이 아팠군요. 그런 날이 있어요. 하나님은 그 이름 모를 아픔도 알고 계세요.',
        '무언가 마음이 아프지만 그게 뭔지 모르시겠군요. 말로 표현하지 않아도 돼요. 하나님은 당신의 마음을 다 아세요.',
        '이름 붙이기 어려운 슬픔이 오늘 함께했군요. 그 아픔을 억누르지 마세요. 하나님 앞에 그대로 내어놓으세요.',
        '막연한 아픔이 하루를 채웠군요. 그 감정이 어디서 왔든, 하나님은 당신과 함께 계세요. 혼자가 아닙니다.'
    ],
    '기도_일':[
        '일에 대해 기도하고 싶으셨군요. 지혜가 필요한 상황인가요? 하나님은 구하는 자에게 기쁘게 주세요. 지금 이 마음으로 기도하시면 돼요.',
        '오늘 일에 대해 기도하고 싶으신 마음이 생기셨군요. 그 마음 자체가 하나님이 당신을 부르시는 신호이에요. 지금 그대로 기도하세요.',
        '직장이나 할 일들을 위해 기도하고 싶으셨군요. 하나님은 우리의 일상도 돌보세요. 그 기도가 길을 열어줄 것이에요.',
        '일 때문에 기도가 필요하다고 느끼셨군요. 지혜와 방향이 필요하실 때 하나님은 가장 좋은 길을 보여주세요.',
        '오늘 업무와 관련된 기도를 드리고 싶으셨군요. 하나님은 당신의 일도 관심을 가지고 계세요. 그 기도를 지금 드리세요.',
        '일에 대한 기도의 마음이 생기셨군요. 그 마음이 이미 기도의 시작이에요. 하나님은 들으실 준비가 되어 있어요.'
    ],
    '기도_가족':[
        '가족을 위해 기도하고 싶으셨군요. 그 마음 자체가 이미 하나님께 닿아 있어요. 가족을 위한 당신의 기도는 세상에서 가장 아름다운 사랑의 표현이에요.',
        '사랑하는 가족을 위해 기도하고 싶으셨군요. 그 마음을 하나님이 귀하게 보고 계세요. 지금 그 마음으로 기도하세요.',
        '가족을 위해 기도드리고 싶은 마음이 드셨군요. 그 기도가 가족을 보호하는 울타리가 돼요. 하나님이 들으십니다.',
        '가족을 위한 기도의 마음이 오늘 생기셨군요. 그 사랑이 기도로 이어지는 것이 아름답아요. 하나님이 그 기도를 기뻐하세요.',
        '가족을 위해 하나님께 나아가고 싶으셨군요. 가장 강한 사랑의 행동이 기도예요. 지금 그 기도를 드리세요.',
        '사랑하는 가족을 위해 기도하고 싶은 마음이 드셨군요. 그 마음이 이미 하나님 앞에 닿아있어요.'
    ],
    '기도_공부':[
        '공부에 대해 기도하고 싶으셨군요. 내 힘으로 안 된다는 것을 느꼈을 때, 그것이 기도의 문이 열리는 순간이에요. 하나님은 당신의 공부길을 인도하실 것이에요.',
        '공부에 하나님의 도움이 필요하다고 느끼셨군요. 그 인식이 지혜의 시작이에요. 지혜를 구하는 자에게 하나님은 풍성히 주세요.',
        '학업을 위해 기도하고 싶은 마음이 드셨군요. 그 마음이 이미 하나님 앞에 닿아 있어요. 공부길을 그분이 인도하실 것이에요.',
        '오늘 공부를 위해 기도하고 싶으셨군요. 지식의 근원이신 하나님께 구하는 것이 가장 지혜로운 방법이에요.',
        '공부 때문에 기도의 필요를 느끼셨군요. 그 필요를 하나님께 가져가세요. 그분이 필요한 것을 채워주실 것이에요.',
        '배움의 여정을 위해 기도하고 싶으셨군요. 하나님은 지식과 명철의 근원이십니다. 그분과 함께하면 길이 열립니다.'
    ],
    '기도_사람':[
        '누군가를 위해 기도하고 싶으셨군요. 그 사람을 위해 기도할 마음이 생긴 것, 그것 자체가 하나님의 일하심이에요. 지금 그 마음으로 기도하세요.',
        '어떤 사람을 위해 기도하고 싶으셨군요. 그 마음이 하나님이 당신 안에서 일하시는 증거이에요. 지금 그 기도를 드리세요.',
        '누군가를 위해 중보하고 싶은 마음이 드셨군요. 그 기도가 그 사람의 삶을 변화시킬 수 있어요. 하나님이 들으십니다.',
        '특정 사람을 위한 기도의 마음이 생기셨군요. 그것이 하나님이 그 사람을 위해 당신을 사용하시는 방법일 수 있어요.',
        '누군가를 위해 기도하고 싶은 마음이 드셨군요. 그 마음 자체가 사랑이에요. 지금 그 사랑을 기도로 드리세요.',
        '어떤 사람을 위해 하나님께 나아가고 싶으셨군요. 그 중보의 마음이 귀해요. 지금 그대로 기도하세요.'
    ],
    '기도_모름':[
        '무엇을 위해 기도해야 할지 모르지만 기도하고 싶으셨군요. 기도의 말이 없어도 괜찮아요. 성령님이 당신의 마음을 아시고 하나님께 전해주실 것이에요.',
        '뭘 기도해야 할지 모르지만 기도하고 싶으셨군요. 그 막연한 열망 자체가 하나님을 향한 것이에요. 그 마음 그대로 하나님께 나아가세요.',
        '기도하고 싶지만 무슨 말을 해야 할지 모르셨군요. 말이 없어도 돼요. 하나님은 마음의 언어를 아세요.',
        '무엇을 위해 기도해야 할지 막막하셨군요. 성령님이 당신을 도우십니다. 그냥 하나님 앞에 나아오는 것만으로 충분해요.',
        '기도의 마음은 있는데 내용을 모르겠으셨군요. 그 갈망 자체가 기도예요. 하나님은 말보다 마음을 보세요.',
        '이유는 모르지만 기도하고 싶다는 마음이 드셨군요. 그 마음이 이미 하나님의 응답을 향해 열려있어요.'
    ],
    '감사_건강':[
        '건강 안에서 감사를 느끼셨군요. 오늘 숨 쉬고 걷고 먹을 수 있었던 것도 은혜예요. 당연해 보이는 것들 속에 하나님의 돌보심이 있어요.',
        '몸이 허락해 준 오늘 하루가 감사하셨군요. 건강은 당연한 것이 아니라 선물이에요. 그 선물을 알아보신 마음이 참 귀해요.',
        '건강에 대한 감사가 마음에 올라왔군요. 힘든 날을 지나왔기에 더 깊이 느껴지는 감사일지도 몰라요. 하나님은 그 걸음을 기억하세요.',
        '오늘 몸이 편안했던 것이 감사하셨군요. 작고 평범한 것에서 은혜를 발견하는 눈이 있으니 복된 하루였어요.'
    ],
    '감사_자녀':[
        '자녀로 인해 감사하셨군요. 아이는 하나님이 맡기신 선물이에요. 오늘 그 아이를 바라보며 느낀 기쁨을 오래 간직하세요.',
        '아이와 함께한 시간이 감사로 남았군요. 작은 웃음 하나, 짧은 대화 하나에도 하나님의 선물이 담겨 있어요.',
        '자녀를 생각하면 마음이 따뜻해지는 밤이군요. 그 사랑을 가장 먼저 아시는 분이 하나님이세요. 그 감사를 기도로 올려 드려요.',
        '자녀가 곁에 있다는 것이 감사한 하루였군요. 자라는 모습을 지켜보는 일도 은혜예요. 오늘의 이 마음을 기억해 두세요.'
    ],
    '감사_신앙':[
        '신앙 안에서 감사를 느끼셨군요. 믿음의 길에 서 있다는 것 자체가 은혜예요. 그 감사가 내일의 걸음을 붙들어 줄 거예요.',
        '하나님을 향한 감사가 마음에 가득하셨군요. 그 마음은 우리 힘으로 만든 것이 아니라 그분이 주신 것이에요.',
        '예배나 말씀, 기도 가운데 감사가 올라왔군요. 하나님은 그렇게 조용히 당신 곁에 가까이 계세요.',
        '믿음의 길을 걸어온 시간이 감사하게 느껴지셨군요. 걸음이 더딘 날에도 하나님은 한 걸음도 놓치지 않고 함께하셨어요.'
    ],
    '평안_건강':[
        '몸과 마음이 고요한 하루였군요. 평안은 억지로 만드는 것이 아니라 주시는 것이에요. 이 쉼을 충분히 누리세요.',
        '건강 가운데 평안을 느끼셨군요. 오늘 몸이 편안했다면, 그 편안함에 감사하며 천천히 숨을 쉬어 보세요.',
        '몸이 가벼운 날이군요. 이런 날은 하나님이 주시는 쉼의 시간이에요. 서두르지 않아도 괜찮아요.',
        '건강에 대해 마음이 놓이는 하루였군요. 그 평안을 감사로 하나님께 올려 드리고, 오늘 밤 편히 쉬세요.'
    ],
    '평안_자녀':[
        '자녀를 생각하며 마음이 평안하셨군요. 아이를 하나님 손에 맡길 때 오는 평안이 있어요. 그 마음을 오래 간직하세요.',
        '아이들이 안전하고 평온하게 하루를 보내 마음이 놓이셨군요. 오늘 밤은 그 고요함을 누리세요.',
        '자녀 일로 오래 마음 쓰셨다면 오늘의 평안이 더 귀하게 느껴질 거예요. 하나님이 주신 쉼이에요.',
        '자녀와 함께한 조용한 시간이 마음을 쉬게 했군요. 그 평범한 고요함이 사실은 큰 은혜예요.'
    ],
    '평안_신앙':[
        '신앙 안에서 평안하셨군요. 하나님 앞에 있으면 마음이 고요해져요. 그 평안을 오늘 밤 마음껏 누리세요.',
        '말씀과 기도 가운데 마음이 잔잔해지셨군요. 그분이 주시는 평안은 세상이 주는 것과 달라요.',
        '믿음 안에서 쉼을 얻으셨군요. 무엇을 더 해야 한다는 부담을 내려놓고, 그저 그분 앞에 머무세요.',
        '하나님이 가까이 계심을 느끼셨나요? 그 고요한 확신을 품고 오늘 밤 잠자리에 드세요.'
    ],
    '걱정_건강':[
        '건강에 대한 걱정이 마음을 누르셨군요. 몸의 일은 우리가 다 알 수 없어서 더 불안하지요. 그 걱정을 하나님 앞에 그대로 내어놓으셔도 돼요.',
        '몸 상태가 마음에 걸리셨군요. 걱정되는 마음이 드는 것은 당연해요. 필요하면 병원이나 가까운 사람의 도움도 받으시고, 마음은 하나님께 맡겨 보세요.',
        '건강이 걱정되어 하루가 무거우셨군요. 내일 일을 오늘 다 짊어지지 않아도 돼요. 오늘 밤은 하나님 안에서 쉬세요.',
        '아프지 않을까, 나빠지지 않을까 마음이 조마조마하셨군요. 그 불안을 하나님은 다 알고 계세요. 혼자 안고 계시지 않아도 돼요.'
    ],
    '걱정_자녀':[
        '자녀가 걱정되셨군요. 사랑하기에 마음이 쓰이는 거예요. 그 아이를 누구보다 아끼시는 하나님께 맡기세요.',
        '아이의 앞날과 지금의 모습이 마음에 걸리셨군요. 부모의 걱정은 곧 사랑이에요. 그 마음을 기도로 올려 드려요.',
        '자녀 일로 잠들기 어려운 밤이군요. 아이를 지키시는 분은 결국 하나님이세요. 오늘은 그분께 맡기고 쉬세요.',
        '자녀를 향한 걱정이 마음을 채웠군요. 부모가 다 할 수 없는 부분을 하나님이 채워 주세요. 혼자 애쓰지 않으셔도 돼요.'
    ],
    '걱정_신앙':[
        '신앙에 대해 걱정이 드셨군요. 믿음이 흔들리는 것 같아 마음이 무거우셨나요? 그 마음을 숨기지 않고 하나님께 말씀드려도 돼요.',
        '믿음이 부족한 것 같아 걱정되셨군요. 그런 마음으로 주님 앞에 나온 것 자체가 이미 그분을 찾는 걸음이에요.',
        '신앙생활이 잘 되고 있는지 불안하셨군요. 하나님은 완벽한 모습이 아니라, 부족한 채로 나아오는 당신을 기뻐하세요.',
        '믿음에 대한 의문이나 걱정이 있으셨군요. 정직하게 묻는 마음도 하나님은 외면하지 않으세요.'
    ],
    '지침_건강':[
        '몸이 지쳐 있는 하루였군요. 쉬는 것도 하나님이 허락하신 돌봄이에요. 오늘은 스스로를 너그럽게 대해 주세요.',
        '몸이 말을 안 듣는 날이군요. 힘이 나지 않는 날은 그저 쉬어도 괜찮아요. 하나님은 그런 당신을 나무라지 않으세요.',
        '건강 때문에 마음까지 지치셨군요. 오래 애써 오셨다면 더욱 힘드셨을 거예요. 오늘 밤은 아무것도 하지 않아도 돼요.',
        '몸과 마음이 함께 무거운 날이군요. 주님은 수고하고 무거운 짐 진 자들을 오라고 부르시며 쉬게 하겠다고 하셨어요. 그 부르심 앞에 잠시 머무세요.'
    ],
    '지침_자녀':[
        '아이를 돌보느라 몹시 지치셨군요. 하루 종일 쏟은 사랑과 수고를 하나님은 다 보고 계세요.',
        '자녀 키우는 일이 버겁게 느껴지는 날이군요. 완벽하지 않아도 괜찮아요. 오늘도 곁에 있어 주신 것만으로 충분해요.',
        '부모의 자리가 무겁게 느껴지셨군요. 그 무게를 혼자 지지 않으셔도 돼요. 하나님이 당신도 돌보세요.',
        '자녀를 위해 쏟은 하루가 기운을 다 가져간 듯하군요. 오늘 밤은 아이만이 아니라 당신도 쉼이 필요한 사람이에요.'
    ],
    '지침_신앙':[
        '신앙생활이 버겁게 느껴지는 날이군요. 잘해야 한다는 부담이 있으셨나요? 하나님은 당신이 쉬기를 원하세요.',
        '믿음의 길을 걷다 지치셨군요. 그런 날에도 하나님은 당신 곁에 계세요. 잠시 멈추어 숨을 고르셔도 괜찮아요.',
        '예배와 섬김에 마음이 메말라 가는 듯하셨군요. 그 마른 마음도 그대로 주님께 가져가세요. 그분이 채워 주세요.',
        '믿음이 의무처럼 느껴져 지치셨군요. 하나님은 성과를 요구하시기보다 당신과 함께 있기를 기뻐하세요.'
    ],
    '아픔_건강':[
        '건강 때문에 마음이 아프셨군요. 몸의 고통이 마음까지 흔들 때가 있지요. 그 아픔을 하나님은 알고 계시고, 당신 곁에 계세요.',
        '아픈 몸으로 하루를 견디셨군요. 얼마나 힘드셨을까요. 오늘 밤 하나님이 곁에 함께 계심을 기억하세요.',
        '몸이 아프니 마음도 약해지는 때이군요. 약해진 모습 그대로 하나님 앞에 나와도 돼요.',
        '건강을 잃은 아픔은 말로 다 하기 어렵지요. 그 마음을 억지로 설명하지 않아도 돼요. 주님은 당신의 눈물을 아세요.'
    ],
    '아픔_자녀':[
        '자녀 일로 마음이 아프셨군요. 사랑하는 아이 때문에 아픈 마음은 가장 깊어요. 하나님도 그 눈물을 알고 계세요.',
        '아이와의 관계나 아이의 힘든 모습에 마음이 무너지셨군요. 그 아이를 향한 사랑은 하나님이 주신 마음이에요.',
        '자녀 때문에 아픈 마음은 누구에게 말하기도 어렵지요. 오늘 밤 하나님 앞에서는 다 말씀하셔도 돼요.',
        '자녀를 향한 마음이 아프게 다가온 하루였군요. 하나님은 그 아이도, 그 아이를 위해 우는 당신도 지켜보고 계세요.'
    ],
    '아픔_신앙':[
        '신앙 안에서 마음이 아프셨군요. 기도가 닿지 않는 것 같거나 하나님이 멀게 느껴질 때가 있지요. 그 아픔을 숨기지 않아도 돼요.',
        '교회나 믿음의 공동체에서 받은 상처가 있으셨군요. 사람 때문에 아픈 마음도 하나님은 아세요. 주님은 마음이 상한 자를 가까이하세요.',
        '믿음이 흔들려 아프셨군요. 시편에는 "어느 때까지니이까" 하고 하나님께 묻는 기도가 있어요. 그 물음도 기도가 될 수 있어요.',
        '하나님이 침묵하시는 것 같아 마음이 아프셨군요. 그 침묵 속에서도 그분은 당신을 떠나지 않으세요.'
    ],
    '기도_건강':[
        '건강을 위해 기도하고 싶으셨군요. 몸과 마음을 아시는 하나님께 있는 그대로 말씀드려 보세요.',
        '아픈 사람, 혹은 나의 건강을 위해 기도하고 싶은 밤이군요. 기도는 하나님께 마음을 여는 일이에요. 구하는 것도, 맡기는 것도 모두 기도예요.',
        '건강을 두고 기도하고 싶은 마음이 드셨군요. 완전한 문장이 아니어도 괜찮아요. 하나님은 마음의 소리를 들으세요.',
        '몸의 연약함을 하나님께 아뢰고 싶으셨군요. 약함 가운데 그분의 도우심을 구하는 기도는 귀해요.'
    ],
    '기도_자녀':[
        '자녀를 위해 기도하고 싶으셨군요. 부모의 기도는 아이를 향한 가장 깊은 사랑의 표현이에요. 그 이름을 하나님께 불러 드려요.',
        '아이를 위해 무엇을 구해야 할지 몰라도 괜찮아요. 이름만 불러도 하나님은 그 마음을 아세요.',
        '자녀를 하나님께 맡기고 싶은 밤이군요. 오늘 밤 그 아이를 그분의 품에 맡겨 드려요.',
        '자녀를 위한 기도가 마음에서 올라왔군요. 하나님은 그 아이를 당신보다 더 깊이 사랑하세요.'
    ],
    '기도_신앙':[
        '믿음의 길에서 기도하고 싶으셨군요. 기도하고 싶다는 그 마음이 이미 하나님이 주신 것이에요.',
        '신앙을 더 깊게 하고 싶은 마음이 있으셨군요. 큰 결심보다 오늘 밤 한 번의 기도가 더 소중해요.',
        '하나님과 더 가까워지고 싶으셨군요. 그 갈망을 하나님은 기뻐하세요. 천천히 그분께 나아가요.',
        '기도할 말이 잘 떠오르지 않아도 괜찮아요. 주님이 가르쳐 주신 기도로 시작해도 좋고, 침묵으로 그분 앞에 머물러도 좋아요.'
    ]
};
const REFLECTIONS_EN = {
    '감사_일':[
        'You found gratitude in your work today. That thankfulness is a quiet sign that God sees your effort. Nothing you did today was in vain.',
        'You discovered something to be grateful for in your work today. God notices every act of faithful labor. Carry that gratitude into tomorrow.',
        'Today\'s work became a moment of thanksgiving. God is in the details of your day. That awareness is itself a gift.',
        'Gratitude rose up in you through your work today. That is not small. God is pleased when we notice His hand in ordinary things.',
        'Even in a busy day, you found something to be thankful for. God sees every effort you make. Today was enough.',
        'Your gratitude in work today is a form of worship. God honors the work of faithful hands. Well done.'
    ],
    '감사_가족':[
        'You felt gratitude through your family today. Family is the closest gift God has given us. Recognizing that gift today — what a blessed day it was.',
        'Your family brought you gratitude today. God often speaks His love through those closest to us. Cherish that connection.',
        'You were reminded today of how precious your family is. That awareness is God\'s gift. Hold it close.',
        'Gratitude for your family filled you today. That warmth is a reflection of God\'s love. Be thankful for those He placed in your life.',
        'Today your family was a source of thankfulness. God gives us family so we can glimpse His love. How beautiful.',
        'The small moments with family made you grateful today. Those ordinary moments are holy ground. God is in them.'
    ],
    '감사_공부':[
        'You found gratitude in learning today. Thank God for the chance to gain knowledge and the gift of understanding. Learning itself is grace.',
        'Today\'s studies brought you a heart of thanks. Every insight you gained is a gift from the One who gives wisdom generously.',
        'You were grateful for the opportunity to learn today. God is the source of all knowledge. Honor Him with how you use it.',
        'Gratitude rose in you through learning today. A thankful learner is a wise learner. Keep that posture.',
        'Today\'s study became an act of worship through your grateful heart. God delights in seekers of wisdom.',
        'You found something to be thankful for in your learning today. That spirit of gratitude will carry you far.'
    ],
    '감사_사람':[
        'You felt grateful for someone today. Did someone warm your day? That person may have been sent by God.',
        'A person made you feel grateful today. God often uses people to carry His love to us. Receive that gift with open hands.',
        'Someone in your life brought thanksgiving to your heart today. That is no accident. God placed them there.',
        'The people around you gave you reason to be grateful today. Relationships are one of God\'s greatest gifts.',
        'Today a person touched your heart in a way that made you thankful. That person is a blessing from God.',
        'Gratitude for someone in your life filled your heart today. That feeling is a glimpse of the love God has for you.'
    ],
    '감사_모름':[
        'You felt grateful, even if you weren\'t sure why. That nameless thankfulness is a beautiful prayer before God. Just feeling grateful — that\'s enough.',
        'Something stirred gratitude in you today, even without a clear reason. That is the Spirit at work. Let the gratitude flow.',
        'You couldn\'t quite name it, but your heart was thankful today. God knows what it\'s for. Offer it to Him.',
        'A quiet, unexplainable gratitude settled over you today. That is the peace of God passing understanding. Rest in it.',
        'Today you were simply grateful — reason unknown. That is enough. God receives nameless gratitude as beautiful worship.',
        'Sometimes gratitude comes before understanding. Today was one of those days. God is in that mystery.'
    ],
    '평안_일':[
        'You felt peace in the midst of your work today. On what must have been a busy day, finding peace within it is God\'s gift. You guarded your day well.',
        'Peace found you in the middle of your work today. In the busyness, God was there. That peace is His signature.',
        'Even through the demands of the day, you felt a steady calm. That is God\'s peace, which the world cannot give.',
        'Your workday held a quiet peace today. That stillness comes from God\'s presence. You were not alone.',
        'You moved through your work today with a peaceful heart. That is a gift worth noticing. God was with you.',
        'Peace settled into your work today. Amidst the tasks and responsibilities, God kept your heart steady.'
    ],
    '평안_가족':[
        'A peaceful day with family. The peace in your home is a greater blessing than you may know. What a thankful day, having felt that peace.',
        'Your time with family was peaceful today. That harmony is a precious gift. God lives in homes where love and peace dwell.',
        'Peace filled your family interactions today. That is no small thing — it is God\'s work in your relationships.',
        'Home felt peaceful and safe today. That sense of belonging is God\'s gift. Cherish it.',
        'Family brought you peace today. In the warmth of those closest to you, God\'s love is made tangible.',
        'Today your family was a place of rest and peace. That is a blessing to hold close and be grateful for.'
    ],
    '평안_공부':[
        'You found peace while studying today. Being able to approach learning without being driven by pressure — that too is the Lord watching over you.',
        'Your mind was calm as you studied today. That peace in learning is a gift. God guards the hearts of those who seek wisdom.',
        'You studied today without the weight of anxiety pressing in. That quiet focus is God\'s grace at work.',
        'Peace accompanied your learning today. When God is in our study, the burden lifts. You experienced that today.',
        'Today\'s study felt settled and calm. That peace of mind is God\'s presence with you in your learning.',
        'You approached your studies with a peaceful heart today. That is no accident — God was guiding your thoughts.'
    ],
    '평안_사람':[
        'You felt peace in your relationships today. Finding peace with people is not easy. If today was such a day, it\'s a truly thankful one.',
        'Your interactions with people were peaceful today. That harmony doesn\'t come easily — it\'s a gift from God.',
        'The people around you brought peace today, not conflict. That is something to be deeply thankful for.',
        'Relationships felt light and peaceful today. God is the author of true peace between people.',
        'Today your connections with others were restful and warm. That kind of relational peace is God\'s blessing.',
        'Peace marked your time with others today. In those moments, God\'s grace was at work in your relationships.'
    ],
    '평안_모름':[
        'You don\'t know why, but today was peaceful. That unnamed peace is also the Lord\'s gift. Today you received a peace the world cannot give.',
        'A quiet, unexplained peace settled over you today. That is the kind of peace only God gives — beyond understanding.',
        'Today felt calm in ways you can\'t fully explain. That peace is God\'s presence, whether you name it or not.',
        'Something about today was simply peaceful. God often works in ways we don\'t notice until we look back. Today was one.',
        'Peace without a clear source touched your heart today. That is the Spirit\'s work. Receive it with gratitude.',
        'Today you simply felt at peace — and that is enough. God was with you in that stillness.'
    ],
    '걱정_일':[
        'Work made your heart heavy today. Things unresolved, tasks ahead — did they weigh on you? You don\'t need every answer today. Doing what you could was enough.',
        'The demands of work brought worry today. That burden is real. But you don\'t have to carry it alone — God is with you in it.',
        'Work left you with a heavy heart today. Unfinished things and uncertain outcomes — God knows all of them. You can release them tonight.',
        'Today\'s work was a source of anxiety. That\'s okay — bring it to God. He cares about what happens in your daily work.',
        'The weight of your work pressed on you today. You did what you could. Trust God with the rest.',
        'Work brought worries today that stayed with you. Those concerns are not too small for God. He holds every detail of your life.'
    ],
    '걱정_가족':[
        'You worried about your family today. It\'s because you love them. Lay that heart before God. He sees the person you\'re worried about.',
        'Your family was on your heart with worry today. That concern is love in disguise. Give it to God — He loves them even more than you do.',
        'Someone in your family has been weighing on you. That love that makes you worry is beautiful. Trust God with what you cannot control.',
        'Family worry filled your heart today. God holds your family even when you can\'t. Rest in that tonight.',
        'You carried concern for family today. That kind of love is precious. Let God carry the weight of what\'s beyond your reach.',
        'Worry for your family followed you through the day. That care is real and valid. God is watching over them too.'
    ],
    '걱정_공부':[
        'You had worries about your studies today. Were you anxious about keeping up? God knows the path you\'re walking. He watches your steps, not just the results.',
        'Your studies stirred up anxiety today. That pressure is real. But God walks with you in the learning process, not just the outcomes.',
        'Academic worry weighed on you today. God is not only in the results — He is in every step of faithful effort.',
        'You felt anxious about keeping up with your studies today. Bring that worry to God. He gives wisdom to all who ask.',
        'School felt overwhelming with worry today. You are not alone in it. God\'s path for you includes this season of learning.',
        'Study-related anxiety visited you today. That\'s understandable. Trust God with the process and take it one step at a time.'
    ],
    '걱정_사람':[
        'Someone is weighing on your heart today. Did their words or actions stay with you? Things between people sometimes take time. But God holds those relationships too.',
        'A person on your mind brought you worry today. That burden of caring is real. Trust God with that person and that relationship.',
        'Someone caused you concern today. Whatever is happening between you, God sees it. He is at work in that relationship.',
        'You were worried about someone today. That worry comes from love. Give that person to God in prayer tonight.',
        'A person weighed on your heart throughout the day. God cares about that relationship. You can trust Him with it.',
        'Concern for someone stayed with you today. Bring them to God. He can do what we cannot.'
    ],
    '걱정_모름':[
        'There\'s a worry in your heart, even if you can\'t name it. Sometimes we don\'t even know what we\'re worried about. You can bring that heart to God just as it is.',
        'A nameless anxiety followed you today. That\'s okay — God receives our formless worries too. You don\'t need words.',
        'Something unsettled your heart today, even without a clear cause. God understands what you can\'t put into words.',
        'You felt anxious today without knowing exactly why. That experience is real and valid. Bring it all to God.',
        'Unnamed worry visited you today. Even if you can\'t explain it, God already knows. Rest in His understanding.',
        'Your heart carried an unspecified burden today. Lay it before God without needing to explain. He receives it.'
    ],
    '지침_일':[
        'Work wore you out today. You really gave it your all. Being tired means you lived hard. Now you may rest.',
        'Today\'s work took a lot out of you. That exhaustion is proof of effort. God sees every ounce of energy you gave.',
        'You were drained by your work today. You gave it your best. Now it\'s time to rest — and trust God with what remains.',
        'The weight of work left you tired today. That is okay. God replenishes the weary. Rest and let Him restore you.',
        'Work exhausted you today. You did enough. God is not asking for more tonight — just rest.',
        'Today\'s labor left you spent. That is what faithfulness sometimes costs. God honors it. Now rest in His care.'
    ],
    '지침_가족':[
        'You poured yourself out for your family today. Your efforts for them may go unnoticed by others, but God sees them. You did more than enough today.',
        'Caring for your family has worn you out today. That selfless love is seen by God. Your sacrifice is not invisible to Him.',
        'You gave so much to your family today — and now you\'re tired. God notices every act of love you offer.',
        'Your family took a lot out of you today. But love is worth the cost. God will replenish what you\'ve given.',
        'The work of loving and serving your family has left you weary. God honors that. Now it\'s your turn to rest.',
        'You spent yourself for your family today. That is a holy thing. God sees it and is pleased. Rest well.'
    ],
    '지침_공부':[
        'Studying wore you out today. The road of learning is never easy. But what you\'re doing is not in vain. God knows your faithfulness.',
        'Today\'s studying took everything you had. That effort is not wasted. God sees your diligence and honors it.',
        'Learning is hard work, and today it showed. You gave it your best. That is all God asks. Now rest.',
        'You\'re exhausted from studying today. That tiredness is the mark of honest effort. God is proud of your faithfulness.',
        'Your studies drained you today. The season of hard work in learning is not forever. Rest now and trust the process.',
        'Today\'s learning cost you energy and focus. That is not wasted — it is investment. God honors the faithful learner.'
    ],
    '지침_사람':[
        'Being with people drained you today. Meeting and caring for many people takes so much out of you. Tonight, simply be still before God.',
        'People took a lot out of you today. That kind of social exhaustion is real. Find a quiet place with God tonight.',
        'Today\'s interactions left you spent. Being present for others is costly. God sees that generosity.',
        'The weight of relationships drained you today. You gave your presence and care. Now receive rest from God.',
        'People were a source of exhaustion today. That\'s okay. God doesn\'t ask you to be superhuman. Come to Him and rest.',
        'Caring for and engaging with others wore you out today. God honors that. Now be still and let Him replenish you.'
    ],
    '지침_모름':[
        'You\'re just tired, and you\'re not even sure why. There are days like that — not tired because of one thing, just tired. That\'s okay.',
        'A kind of weariness without a clear cause visited you today. That happens. God knows what you\'ve been carrying, even if you don\'t.',
        'Today you\'re simply exhausted — reason unknown. That\'s enough to bring to God. He doesn\'t need an explanation.',
        'You can\'t quite explain the tiredness, but it\'s real. God receives that too. Come to Him as you are.',
        'An unnamed weariness settled over you today. Give yourself permission to rest. God is not asking for more tonight.',
        'Sometimes we\'re just tired without knowing why. That is allowed. God meets you in that weariness.'
    ],
    '아픔_일':[
        'Work left your heart hurting today. Did you go unrecognized, or face a hard situation? God sees your wounded heart up close.',
        'Something in your work wounded you today. That pain is real. God is close to the brokenhearted — especially in the workplace.',
        'Today\'s work brought heartache. Whether it was unfair treatment or a hard loss, God sees what happened to you.',
        'Your heart was hurt through your work today. You don\'t have to pretend it didn\'t hurt. God acknowledges that pain.',
        'Work caused you pain today. That wound deserves attention. Bring it to God — He is the healer of hearts.',
        'What happened at work today left a mark. God sees it. He is near to those whose hearts are broken.'
    ],
    '아픔_가족':[
        'Family left your heart aching today. Pain caused by someone you love is the deepest kind. God knows that heart. This moment too is in His hands.',
        'Someone in your family hurt you today. Love that deep makes pain that deep. God holds both you and them in His hands.',
        'Your family caused you heartache today. That is one of the hardest pains. God understands and is close to you in it.',
        'Pain from family weighed on you today. God is not distant from family wounds — He is right there with you.',
        'Your heart hurts because of someone close to you today. That kind of pain runs deep. God is the healer of those wounds.',
        'Family brought pain today. In that hurt, remember: God is holding you, and He holds them too.'
    ],
    '아픔_공부':[
        'Studying brought you heartache today. Were you struggling to keep up, or did results fall short? Today\'s pain passes tonight. New light comes in the morning.',
        'Your academic journey brought pain today. Whether it was failure or struggle, God sees beyond the result to your heart.',
        'School hurt today. That discouragement is real. But one hard day doesn\'t define your journey — or God\'s plan for you.',
        'Learning was painful today. Results disappointed, or the work felt impossible. God\'s view of you hasn\'t changed.',
        'Today\'s studies left you hurting. That\'s a hard place to be. Bring that discouragement to God tonight.',
        'Pain and disappointment came through your studies today. That hurts. But tomorrow is a new beginning.'
    ],
    '아픔_사람':[
        'Someone hurt you today. Did one word or glance stay with you all day? God is the One who comforts that pain.',
        'A person wounded you today. That pain is real — one word or one action can leave a deep mark. God sees it.',
        'You were hurt by someone today. That wound is valid. God is close to those whose hearts have been injured by others.',
        'Someone\'s words or actions left you hurting today. You don\'t have to minimize that. God acknowledges your pain.',
        'Today a person caused you pain. That is a hard thing to carry. Give that hurt to God — He can hold it.',
        'You were wounded by someone today. That kind of pain lingers. God is near, and He is the great Comforter.'
    ],
    '아픔_모름':[
        'Your heart aches, even if you don\'t know why. Sometimes a sadness comes that can\'t be put into words. There are days like that. You are not alone in this.',
        'You\'re hurting today and can\'t quite name it. That unnamed grief is still grief. God receives it.',
        'A pain without clear origin settled in today. That is real pain nonetheless. God understands it even when you don\'t.',
        'Something aches inside and you can\'t explain it. You don\'t need to explain it to God. He already knows.',
        'Today carried an unidentifiable sadness. That happens. You are not broken — you are human. God is with you.',
        'Your heart is sore today without a clear reason. That kind of hurt is just as real. Bring it to God.'
    ],
    '기도_일':[
        'You wanted to pray about your work today. Do you need wisdom for a situation? God gives generously to those who ask. Pray just as you feel right now.',
        'A desire to pray about your work rose in you today. That longing is God drawing you close. Come to Him about it now.',
        'You felt the need to bring your work to God in prayer. That instinct is right. God cares deeply about your daily work.',
        'Today you wanted to pray about something at work. Let that desire be your prayer. God is listening.',
        'Your heart turned toward prayer about your work today. That is wisdom. God is ready to guide you.',
        'You wanted to invite God into your work situation today. That is exactly the right move. Pray now.'
    ],
    '기도_가족':[
        'You wanted to pray for your family today. That heart is already reaching God. Your prayer for your family is the most beautiful expression of love in the world.',
        'A desire to intercede for your family arose in you today. That love in prayer is powerful. God hears every word.',
        'You felt moved to pray for someone in your family today. That impulse is the Spirit at work. Follow it.',
        'Today you wanted to bring your family before God. That is one of the most loving things you can do. Pray now.',
        'The desire to pray for your family came to you today. Let that desire become prayer. God is faithful.',
        'Interceding for your family was on your heart today. That kind of love is holy. God receives and acts on those prayers.'
    ],
    '기도_공부':[
        'You wanted to pray about your studies today. The moment you feel you can\'t do it on your own — that\'s when the door of prayer opens. God will guide your path of learning.',
        'A longing to pray about your studies arose today. That dependence on God is the beginning of wisdom.',
        'You felt the need to bring your learning to God today. He is the source of all wisdom. Ask, and He will give.',
        'Today you wanted to pray for your academic journey. That\'s right — bring it to the One who gives wisdom generously.',
        'Your studies moved you to prayer today. That instinct is wise. God cares about your learning and will guide it.',
        'The desire to invite God into your studies came today. Follow that impulse. He will illuminate the way.'
    ],
    '기도_사람':[
        'You wanted to pray for someone today. The desire to pray for them arising in you — that itself is God at work. Pray with that heart right now.',
        'Someone came to your mind for prayer today. That is often the Spirit nudging you to intercede. Pray for them now.',
        'Today you felt called to pray for someone. That movement in your heart is sacred. Follow it into prayer.',
        'A desire to lift someone up to God came over you today. That is love in action. Let it become prayer.',
        'You wanted to pray for a person in your life today. That impulse is from God. Act on it.',
        'Interceding for someone was on your heart today. That desire is holy. Pray for them — God will listen.'
    ],
    '기도_모름':[
        'You don\'t know what to pray, but you wanted to pray. That\'s okay. The Spirit knows your heart and will carry it to God for you.',
        'You felt drawn to prayer without knowing what to say. That wordless longing is itself a prayer. God understands.',
        'The desire to pray came without clear words. That is enough. The Spirit intercedes for what we cannot express.',
        'Today you wanted to pray, even if you didn\'t know what to ask for. That hunger is holy. God receives it.',
        'You came to prayer empty-handed today. That is a beautiful place to start. God does the rest.',
        'A longing for God that couldn\'t find words visited you today. That is prayer in its purest form. God heard it.'
    ],
    '감사_건강':[
        'You felt thankful for your health today. Simply being able to breathe, walk and eat is grace. God\'s care is present in the things that seem ordinary.',
        'You are grateful for what your body allowed you to do today. Health is not something owed to us; it is a gift. It is precious that you noticed.',
        'Gratitude for your health rose up in you. Perhaps it feels deeper because you have walked through harder days. God remembers every step of that road.',
        'Your body felt at ease today, and you were thankful. A heart that finds grace in small, plain things has had a blessed day.'
    ],
    '감사_자녀':[
        'You are thankful for your child today. A child is a gift entrusted to us by God. Keep the joy you felt in watching them close to your heart.',
        'The time you spent with your child became gratitude. Even one small laugh or short conversation holds a gift from God.',
        'Thinking of your child warms your heart tonight. God knows that love before anyone else does. Offer your thanks to Him in prayer.',
        'It was a day of being thankful that your child is near. Watching them grow is grace too. Remember this feeling tonight.'
    ],
    '감사_신앙':[
        'You felt thankful in your faith. Standing on the path of faith is itself grace. That gratitude will hold up your steps tomorrow.',
        'Your heart was full of thanks toward God. That feeling was not made by your own strength; He gave it to you.',
        'Gratitude rose in you through worship, His Word or prayer. This is how quietly God draws near to you.',
        'You looked back with thanks on the time you have walked in faith. Even when the pace felt slow, God did not miss a single step beside you.'
    ],
    '평안_건강':[
        'Your body and heart were quiet today. Peace is not something we force; it is something given. Rest in it fully.',
        'You felt peace in your health. If your body felt at ease today, give thanks and breathe slowly.',
        'Your body felt light today. Days like this are a time of rest from God. You do not need to hurry.',
        'Your mind was at ease about your health today. Give that peace back to God in thanks, and rest well tonight.'
    ],
    '평안_자녀':[
        'You felt peace as you thought of your child. There is a peace that comes when we place our children in God\'s hands. Hold on to it.',
        'Your children seemed safe and calm today, and your heart settled. Enjoy that stillness tonight.',
        'If you have carried worry for your child for a long time, today\'s peace feels even more precious. It is a rest God has given you.',
        'A quiet time with your child let your heart rest. That plain stillness is, in fact, great grace.'
    ],
    '평안_신앙':[
        'You were at peace in your faith. In God\'s presence the heart grows still. Enjoy that peace fully tonight.',
        'Your heart grew calm in His Word and in prayer. The peace He gives is not like the peace the world gives.',
        'You found rest in faith. Set down the pressure to do more, and simply stay in His presence.',
        'Did you sense that God is near? Carry that quiet assurance with you into sleep tonight.'
    ],
    '걱정_건강':[
        'Worry about your health weighed on you. Matters of the body are hard to fully know, which makes them more unsettling. You can lay that worry before God just as it is.',
        'Your physical condition has been on your mind. It is natural to feel worried. Seek the help of a doctor or someone close to you if you need it, and entrust your heart to God.',
        'Worry about your health made today heavy. You do not have to carry all of tomorrow tonight. Rest in God this evening.',
        'You have been anxious about getting sick or getting worse. God knows all of that fear. You do not have to hold it alone.'
    ],
    '걱정_자녀':[
        'You worried about your child. You care this much because you love them. Entrust them to God, who cherishes them more than anyone.',
        'Your child\'s future and present struggles weighed on you. A parent\'s worry is a form of love. Lift it to God in prayer.',
        'It may be a night when sleep is hard because of your child. In the end it is God who watches over them. Entrust them to Him and rest.',
        'Worry for your child filled your heart. What a parent cannot do, God fills in. You do not have to strive alone.'
    ],
    '걱정_신앙':[
        'You have been worried about your faith. Does it feel as if your faith is shaking? You can tell God exactly how you feel.',
        'You worried that your faith is not enough. Coming before the Lord in that very state is already a step toward Him.',
        'You felt anxious about whether your life of faith is going well. God delights in you as you come to Him, imperfect as you are.',
        'You have questions or worries about your faith. God does not turn away from an honest question.'
    ],
    '지침_건강':[
        'Your body was worn out today. Rest, too, is a form of care God allows. Be gentle with yourself tonight.',
        'Your body did not cooperate today. On days without strength, it is all right simply to rest. God does not scold you for it.',
        'Health concerns have worn out your heart as well. If you have struggled for a long time, it must be even harder. Tonight you do not have to do anything.',
        'Both body and heart feel heavy. Jesus called those who are weary and burdened and promised them rest. Stay for a moment before that call.'
    ],
    '지침_자녀':[
        'You are exhausted from caring for your child. God sees all the love and effort you poured out today.',
        'Raising a child feels overwhelming today. You do not have to be perfect. Simply being there for them today was enough.',
        'The weight of being a parent felt heavy. You do not have to carry it alone. God cares for you too.',
        'A day spent on your child seems to have taken all your strength. Tonight, not only your child but you also need rest.'
    ],
    '지침_신앙':[
        'Your life of faith feels heavy today. Did you feel pressure to do well? God wants you to rest.',
        'You grew weary on the path of faith. Even on such days God is beside you. It is all right to pause and catch your breath.',
        'Your heart felt dry in worship and service. Bring that dry heart to the Lord just as it is. He will fill it.',
        'Faith started to feel like a duty, and you grew tired. God delights in being with you more than in what you accomplish.'
    ],
    '아픔_건강':[
        'Your health has brought you pain of heart. Bodily suffering can shake the heart too. God knows that pain and is near you.',
        'You endured the day in a body that hurts. How hard that must have been. Remember tonight that God is with you.',
        'When the body aches, the heart can grow weak too. You may come before God in your weakness, just as you are.',
        'The pain of losing health is hard to put into words. You do not have to explain it. The Lord knows your tears.'
    ],
    '아픔_자녀':[
        'You are hurting over your child. The pain we feel for the ones we love runs deepest. God knows those tears too.',
        'Your heart broke over your relationship with your child, or over seeing them struggle. The love you have for them is a gift from God.',
        'It is hard to tell anyone about the pain you feel for your child. Before God tonight you can say it all.',
        'Your heart for your child came to you as pain today. God sees your child, and He sees you weeping for them.'
    ],
    '아픔_신앙':[
        'You were hurting in your faith. There are times prayers seem unheard or God seems far away. You do not have to hide that pain.',
        'You were wounded in church or in a community of faith. God knows the pain caused by people. The Lord draws near to the brokenhearted.',
        'Your faith shook, and it hurt. The Psalms hold prayers that ask God, "How long?" Your questions can be a prayer too.',
        'It hurt because God seemed silent. Even in that silence, He has not left you.'
    ],
    '기도_건강':[
        'You wanted to pray about health. Tell God, who knows body and heart, exactly how things are.',
        'Tonight you want to pray for someone\'s health, or your own. Prayer is opening your heart to God. Asking and entrusting are both prayer.',
        'You felt moved to pray about health. Complete sentences are not needed. God hears the voice of the heart.',
        'You wanted to bring the weakness of your body to God. A prayer that asks for His help in weakness is precious.'
    ],
    '기도_자녀':[
        'You wanted to pray for your child. A parent\'s prayer is the deepest expression of love for them. Call their name before God.',
        'It is all right if you do not know what to ask for your child. God understands even if you only say their name.',
        'You want to entrust your child to God tonight. Entrust them to His arms now.',
        'A prayer for your child rose from your heart. God loves them even more deeply than you do.'
    ],
    '기도_신앙':[
        'You wanted to pray along your path of faith. The desire to pray is already a gift from God.',
        'You want to deepen your faith. One prayer tonight means more than a grand resolution.',
        'You wanted to draw closer to God. He delights in that longing. Come to Him slowly.',
        'It is fine if words do not come. You may begin with the prayer the Lord taught us, or simply stay quiet in His presence.'
    ]
};

/* 응원 (24개) */
const ENCS = {
    '감사_위로':['오늘 감사한 마음이 들었다는 것 자체가 하나님의 선물이에요. 그 마음을 오늘 밤도 품고 주무세요.','당신의 감사가 하나님의 마음을 기쁘게 해요. 그 감사를 내일도 이어가세요.','오늘 위로를 받을 수 있는 감사한 마음이 생겼군요. 그 마음이 내일도 당신을 붙들어줄 것이에요.','감사와 위로가 함께한 하루였군요. 하나님이 오늘도 당신 곁에 계셨어요.','오늘의 감사가 내일의 위로가 돼요. 하나님의 선하심을 기억하세요.','작은 감사도 하나님 앞에서는 큰 예배이에요. 오늘 하루 잘 마무리하세요.'],
    '감사_힘'  :['감사한 마음이 있는 곳에 힘이 납니다. 오늘 하루도 충분히 잘 하셨어요.','감사가 힘의 원천이에요. 내일도 그 감사로 나아가세요.','오늘 감사한 마음과 함께 힘을 얻으셨군요. 하나님이 주시는 힘이에요.','감사와 힘이 함께한 하루였군요. 그 에너지로 내일도 달리세요.','오늘 하루 감사하며 힘을 내셨어요. 하나님이 그 걸음과 함께하셨어요.','감사한 마음이 당신을 강하게 만듭니다. 내일도 그 마음을 품으세요.'],
    '감사_지혜':['감사한 마음이 지혜의 시작이에요. 내일도 그 눈으로 세상을 바라보세요.','감사하는 마음에서 지혜가 자랍니다. 오늘 그 씨앗을 심으셨어요.','오늘 감사 속에서 지혜를 얻으셨군요. 하나님이 그 마음에 빛을 비추십니다.','감사와 지혜는 함께 옵니다. 오늘 당신은 그 둘을 모두 받으셨어요.','감사한 눈으로 세상을 보면 지혜가 열립니다. 내일도 그 눈을 유지하세요.','오늘의 감사가 내일의 지혜로 이어집니다. 하나님이 인도하세요.'],
    '감사_쉼'  :['충분히 수고하셨어요. 오늘 받은 은혜를 마음에 담고 편히 쉬세요.','감사한 마음으로 하루를 마치셨군요. 그 감사를 품고 푹 쉬세요.','오늘 은혜 받으셨으니 이제 편히 쉬어도 돼요. 내일도 하나님이 함께하세요.','감사한 마음이 가장 좋은 안식의 준비이에요. 오늘 밤 편히 쉬세요.','수고하고 감사한 하루였군요. 이제 그 감사를 안고 쉬세요. 하나님이 지키십니다.','은혜를 기억하며 하루를 마치세요. 그 감사가 내일 아침 새롭게 시작돼요.'],
    '평안_위로':['오늘의 평안이 하나님의 손길이었음을 기억하세요. 내일도 그 손이 함께해요.','오늘 평안과 위로를 받으셨군요. 하나님이 당신 곁에 계셨기 때문이에요.','평안 속에서 위로를 경험하셨군요. 그 평안은 세상이 줄 수 없는 하나님의 선물이에요.','오늘의 평안이 위로가 되었군요. 하나님의 손이 오늘 당신을 붙들었어요.','평안과 위로가 함께한 하루였군요. 그 모든 것이 하나님에게서 왔아요.','오늘 받은 평안을 내일도 기억하세요. 하나님은 변하지 않으세요.'],
    '평안_힘'  :['평안한 마음이 가장 강한 힘이에요. 오늘의 평안으로 내일도 나아가세요.','오늘 평안 속에서 힘을 얻으셨군요. 그 힘으로 내일도 걸어가세요.','마음의 평안이 진정한 강함이에요. 오늘 하나님이 그 강함을 주셨어요.','평안과 힘이 함께한 하루였군요. 그 에너지가 내일을 밝혀줄 것이에요.','고요한 마음에서 진짜 힘이 납니다. 오늘 그것을 경험하셨어요.','오늘의 평안이 내일의 담대함이 돼요. 하나님이 함께하세요.'],
    '평안_지혜':['마음이 고요할 때 지혜가 들립니다. 오늘의 평안이 내일의 방향이 돼요.','평안한 마음에서 지혜가 자랍니다. 오늘 그 고요함을 잘 지키셨어요.','오늘 평안 속에서 지혜를 얻으셨군요. 그 지혜를 내일도 사용하세요.','고요한 마음이 하나님의 음성을 듣게 해요. 오늘 잘 들으셨어요.','평안과 지혜가 함께한 하루였군요. 하나님이 당신의 마음에 빛을 비추셨어요.','오늘의 평안한 지혜가 내일의 결정을 이끌어줄 것이에요.'],
    '평안_쉼'  :['오늘 평안을 느끼셨으니, 오늘 밤도 그 평안 속에서 푹 쉬세요.','평안이 있는 곳에서의 쉼은 진짜 쉼이에요. 오늘 밤 그 쉼을 누리세요.','오늘의 평안이 가장 좋은 쉼의 조건이에요. 이제 편히 쉬어도 돼요.','평안하게 쉬세요. 오늘 하나님이 당신의 마음을 지키셨어요.','평안과 쉼이 함께한 하루였군요. 그 평안이 내일 아침에도 이어지기를 바라요.','오늘 받은 평안을 안고 쉬세요. 내일도 하나님이 함께하실 것이에요.'],
    '걱정_위로':['걱정하는 마음도 사랑의 한 표현이에요. 그 마음을 하나님께 드리고 오늘 밤은 쉬세요.','걱정이 있어도 하나님이 위로하세요. 그 위로를 오늘 밤 받으세요.','걱정 속에서도 위로를 찾으셨군요. 하나님이 당신 곁에 계세요.','걱정되는 마음과 위로받고 싶은 마음, 둘 다 하나님 앞에 가져가세요.','걱정 속에서도 하나님은 위로하세요. 오늘 밤 그 위로를 붙드세요.','걱정을 하나님께 드리고 위로를 받으세요. 그분이 들으십니다.'],
    '걱정_힘'  :['걱정이 있어도 하루를 버텨내셨어요. 그것만으로도 충분한 용기예요.','걱정 속에서도 나아가신 당신, 대단해요. 하나님이 그 용기를 보셨어요.','걱정이 있어도 포기하지 않으셨군요. 그것이 진짜 힘이에요.','걱정 속에서 힘을 찾으셨군요. 하나님이 그 힘의 원천이십니다.','걱정과 싸우며 하루를 이겨내셨군요. 정말 수고 많으셨어요.','걱정이 있어도 버텨낸 오늘을 감사하세요. 내일은 더 강해질 것이에요.'],
    '걱정_지혜':['답이 보이지 않을 때 기도가 시작돼요. 오늘 밤 그 걱정을 하나님께 맡기세요.','걱정될 때 지혜를 구하세요. 하나님이 길을 보여주실 것이에요.','걱정 속에서 지혜를 구하셨군요. 그 마음이 이미 지혜롭아요.','걱정이 지혜의 기도를 열었군요. 하나님께 구하면 반드시 주세요.','걱정 속에서도 하나님의 지혜를 찾으셨군요. 그 길이 열릴 것이에요.','걱정을 지혜로 바꾸는 것은 하나님만 하실 수 있어요. 그분께 맡기세요.'],
    '걱정_쉼'  :['걱정은 내려놓고 오늘 밤은 쉬셔도 돼요. 내일의 일은 내일이 감당해요.','걱정을 잠시 내려놓고 쉬세요. 하나님이 그 걱정을 맡아주세요.','오늘 밤만큼은 걱정을 하나님께 드리고 쉬세요. 그분이 지키십니다.','걱정 속에서도 쉴 수 있어요. 하나님이 함께하시기 때문이에요.','걱정은 내일로 미루고 오늘 밤은 쉬어도 돼요. 하나님이 함께 계세요.','걱정을 기도로 바꾸고 쉬세요. 하나님이 그 모든 것을 알고 계세요.'],
    '지침_위로':['지쳤다는 것은 그만큼 열심히 살았다는 뜻이에요. 하나님이 그 수고를 알고 계세요.','많이 지치셨군요. 하나님이 위로의 팔로 안아주세요. 혼자가 아닙니다.','지쳐도 위로가 있어요. 하나님이 당신 곁에 계세요.','지침과 위로가 함께 찾아왔군요. 하나님이 당신의 수고를 알고 위로하세요.','지쳤을 때 하나님의 위로가 더 크게 느껴집니다. 오늘 그 위로를 받으세요.','당신의 수고를 하나님이 알고 계세요. 위로받고 쉬세요.'],
    '지침_힘'  :['오늘 버티신 것이 이미 큰 힘이었어요. 내일은 새로운 힘으로 다시 시작하세요.','지쳐도 버텨낸 오늘이 대단해요. 하나님이 새 힘을 주실 것이에요.','지침 속에서도 힘을 내셨군요. 그 힘이 하나님에게서 왔아요.','오늘의 수고가 내일의 힘이 돼요. 하나님이 채워주실 것이에요.','지쳤지만 포기하지 않으셨군요. 그것이 진짜 강함이에요.','지쳐도 다시 일어나는 힘이 있어요. 하나님이 그 힘의 원천이십니다.'],
    '지침_지혜':['지쳤을 때 멈추는 것도 지혜이에요. 오늘 밤 하나님 앞에 쉬어가세요.','지침 속에서 멈출 줄 아는 것이 지혜이에요. 오늘 잘 하셨어요.','지칠 때 쉬는 것도 하나님의 지혜이에요. 그 지혜를 따르세요.','오늘 지침 속에서 지혜를 발견하셨군요. 하나님이 인도하세요.','지쳤을 때 하나님의 지혜가 필요해요. 그 지혜를 구하며 쉬세요.','멈추고 쉬는 것이 때로 가장 지혜로운 선택이에요. 오늘이 그런 날이에요.'],
    '지침_쉼'  :['이제 쉬셔도 돼요. 충분히 수고하셨고, 하나님이 나머지를 돌봐주실 것이에요.','지쳤으니 이제 쉬세요. 하나님이 당신의 쉼을 지키십니다.','오늘 충분히 하셨어요. 이제 쉬어도 돼요. 하나님이 함께하세요.','수고한 뒤의 쉼이 가장 달콤해요. 오늘 그 쉼을 누리세요.','지쳤을 때 쉬는 것이 하나님의 뜻이에요. 이제 내려놓고 쉬세요.','오늘의 수고를 하나님께 드리고 편히 쉬세요. 그분이 다 받으십니다.'],
    '아픔_위로':['아픈 마음을 하나님이 가장 가까이서 보고 계세요. 혼자가 아닙니다.','마음이 아플 때 하나님이 가장 가까이 오세요. 오늘 그분을 느끼세요.','아픔 속에도 위로가 있어요. 하나님이 당신의 상처를 보고 계세요.','아파도 혼자가 아닙니다. 하나님이 당신의 아픔을 다 아세요.','마음의 아픔도 하나님 앞에 가져가면 위로가 돼요. 그분이 안아주세요.','상한 마음 곁에 하나님이 계세요. 오늘 그 위로를 받으세요.'],
    '아픔_힘'  :['아픈 만큼 하나님께 더 의지하게 돼요. 그것이 진짜 힘이에요.','아픔이 하나님을 더 가까이 붙들게 해요. 그 힘을 놓지 마세요.','아파도 포기하지 않으셨군요. 그것이 진짜 용기예요.','아픔 속에서 힘을 찾으셨군요. 하나님이 그 힘의 원천이십니다.','아파도 버텨낸 오늘이 대단해요. 하나님이 당신을 붙들고 계세요.','아픔 속에서도 하나님을 의지하는 것이 가장 강한 힘이에요.'],
    '아픔_지혜':['지금 이 아픔이 언젠가 누군가를 위로하는 지혜가 돼요. 하나님의 계획을 믿으세요.','이 아픔이 하나님의 손에서 지혜가 돼요. 그 계획을 믿으세요.','아픔도 하나님의 지혜를 배우는 학교이에요. 이 시간이 헛되지 않아요.','아픔 속에서 지혜를 구하셨군요. 하나님은 구하는 이에게 후히 주시는 분이세요.','이 아픔이 언젠가 아름다운 이야기가 돼요. 하나님의 계획을 신뢰하세요.','아픔도 하나님의 손 안에 있어요. 그 지혜를 기다리세요.'],
    '아픔_쉼'  :['오늘 아팠다면 오늘 충분히 쉬어야 해요. 하나님이 당신 곁에 계세요.','아팠으니 이제 쉬세요. 하나님이 치유하실 것이에요.','상처 받은 마음은 쉬어야 해요. 하나님 앞에 잠잠히 쉬세요.','아픔 후의 쉼이 가장 필요한 치유이에요. 하나님이 함께하세요.','아픔을 하나님께 드리고 편히 쉬세요. 그분이 지키십니다.','오늘 마음이 아팠다면 충분히 쉬어도 돼요. 하나님이 당신을 안고 계세요.'],
    '기도_위로':['기도하고 싶은 마음이 든 것 자체가 하나님이 당신을 부르시는 신호이에요.','기도하고 싶다는 마음이 들었군요. 그 마음으로 하나님께 나아가세요. 위로가 있어요.','기도를 통해 위로를 받고 싶으셨군요. 하나님이 기다리고 계세요.','기도하고 싶은 마음이 이미 하나님을 향한 첫걸음이에요.','기도와 위로를 동시에 원하셨군요. 하나님이 그 두 가지를 모두 주세요.','기도하러 나아오는 마음이 귀해요. 하나님이 위로하실 것이에요.'],
    '기도_힘'  :['기도는 하나님의 힘을 빌리는 일이에요. 오늘 밤 그 힘을 구하세요.','기도하고 싶다는 마음이 이미 하나님의 힘을 향한 손이에요.','기도를 통해 힘을 얻으셨으면 하는 마음이 드셨군요. 그 기도를 드리세요.','기도와 힘을 함께 원하셨군요. 하나님이 기도하는 자에게 힘을 주세요.','기도하면 하나님의 힘이 옵니다. 오늘 밤 그 힘을 받으세요.','기도하고 싶다는 마음이 생겼군요. 그 마음으로 나아가면 힘이 옵니다.'],
    '기도_지혜':['모든 지혜의 근원이신 하나님께 구하세요. 하나님은 기도에 귀 기울이세요.','기도하면 지혜가 옵니다. 하나님이 구하는 자에게 풍성히 주세요.','기도를 통해 지혜를 찾으셨군요. 하나님이 그 길을 보여주실 것이에요.','기도와 지혜를 함께 원하셨군요. 하나님이 그 두 가지를 모두 주세요.','기도하면 지혜의 문이 열립니다. 오늘 밤 그 문을 두드리세요.','기도하고 싶은 마음과 지혜를 원하는 마음, 둘 다 하나님께 드리세요.'],
    '기도_쉼'  :['기도한 후에는 쉬어도 돼요. 맡겨드렸으니, 이제 하나님이 일하실 것이에요.','기도하고 쉬세요. 하나님이 그 모든 것을 맡아주세요.','기도를 드린 후에는 편히 쉬어도 돼요. 하나님이 지키십니다.','기도와 쉼을 함께 원하셨군요. 기도하고 나서 편히 쉬세요.','기도하면 마음이 쉬어집니다. 하나님이 그 평안을 주세요.','기도하고 싶었군요. 기도하고 나서 하나님 앞에 안식하세요.']
};
const ENCS_EN = {
    '감사_위로':['The fact that you felt grateful today is itself a gift from God. Carry that heart with you as you sleep tonight.','Your gratitude delights God\'s heart. Let it comfort you as you rest.','Thankfulness and comfort walked with you today. God was in both.','A grateful heart is already comforted. Hold that tonight.','God gave you eyes to see His blessings today. That is comfort enough.','Your gratitude is already a form of prayer. Rest in that tonight.'],
    '감사_힘'  :['Where there is gratitude, there is strength. You did enough today.','Gratitude is fuel. You felt it today — it will carry you forward.','Thankfulness renews energy. Let that strength take you into tomorrow.','A grateful heart is a strong heart. You proved that today.','You found gratitude today, and in it, strength. Well done.','Gratitude keeps us going. You have it — and that\'s enough.'],
    '감사_지혜':['A grateful heart is the beginning of wisdom. See the world through that same lens tomorrow.','Gratitude opens eyes. You saw clearly today. Keep that perspective.','Thankfulness is wise. You practiced it today.','The wisest people are the most grateful. You\'re on that path.','Today\'s gratitude is tomorrow\'s discernment. Hold onto it.','A thankful spirit leads to clear thinking. You walked in that today.'],
    '감사_쉼'  :['You have worked enough. Rest well, holding the grace you received today.','Gratitude is a good place to end the day. Rest in it tonight.','You received grace and you noticed it. That\'s enough. Rest now.','Hold today\'s grace as you drift off to sleep. God gave it to you.','The grace you received today is a gift to take into rest. Sleep well.','Grateful and at peace — rest in that tonight.'],
    '평안_위로':['Remember that today\'s peace was God\'s hand at work. That same hand will be with you tomorrow.','Peace and comfort visited you today. God was near.','The peace you felt was God\'s signature. He is with you.','Peace is one of God\'s greatest gifts. You received it today.','Today\'s calm was God\'s care in action. He comforts through peace.','God gave you peace today. Let that peace comfort you tonight.'],
    '평안_힘'  :['A peaceful heart is the greatest strength. Go forward tomorrow on the peace of today.','Peace is power. You had both today.','Inner calm gives strength to keep going. You felt that today.','Today\'s peace will fuel tomorrow\'s effort. Let it.','A steady heart is a strong heart. That was yours today.','You moved through today with peace. That is powerful.'],
    '평안_지혜':['Wisdom is heard when the heart is still. Today\'s peace becomes tomorrow\'s direction.','A quiet spirit hears God clearly. Today you were in that place.','Peace creates space for wisdom. You had both today.','When the heart is calm, the mind sees far. Today proved that.','Today\'s stillness carried insight. That is God\'s gift to the peaceful.','You were calm enough to hear God today. That peace leads to wisdom.'],
    '평안_쉼'  :['You felt peace today — rest fully in that peace tonight as well.','Peace during the day means rest at night. You have both.','The peace you felt today is the perfect pillow for tonight. Rest well.','Today was peaceful — let tonight be restful. You deserve it.','Rest in the peace God gave you today. It doesn\'t run out.','You rested in God\'s peace today. Continue that rest tonight.'],
    '걱정_위로':['Worry is also an expression of love. Give that heart to God and rest tonight.','Even in worry, God is near to comfort you. Lean on Him.','Your worry today was seen by God. He offers comfort in return.','God comforts the worried heart. Let Him comfort yours tonight.','Give your worry to God. He gives comfort in exchange.','Anxiety and comfort can coexist in God\'s presence. Rest there tonight.'],
    '걱정_힘'  :['You made it through the day, even with worry. That alone is enough courage.','Facing a day full of worry and still showing up — that takes strength.','You were worried but you kept going. That is courage in action.','Worry is heavy. You carried it and still moved forward. That\'s strength.','Getting through a hard day is its own victory. Well done.','You endured worry today. That resilience is a gift from God.'],
    '걱정_지혜':['When answers seem out of reach, prayer begins. Entrust tonight\'s worry to God.','Worry can be the door to wisdom — when it leads us to pray.','God gives wisdom to those who ask. Your worry can lead you there.','Turn your worry into a question and ask God. He answers.','The wisest response to worry is prayer. Let that be your next step.','Anxious thoughts, when given to God, become wisdom in time.'],
    '걱정_쉼'  :['Set down your worries and rest tonight. Tomorrow\'s concerns belong to tomorrow.','Worry doesn\'t need to follow you to bed. Leave it with God.','Tonight, just rest. Tomorrow\'s worries can wait until tomorrow.','God is awake and watching. You can sleep. Leave the worries to Him.','Rest is a form of trust. Let go of worry and sleep.','You\'ve done what you can. Let God handle the rest tonight.'],
    '지침_위로':['Being tired means you lived with all your heart. God knows that effort.','Exhaustion and comfort can meet in God\'s presence. Come to Him tonight.','You are tired — and God sees that. He is near to comfort you.','Your weariness doesn\'t go unnoticed. God offers comfort to the tired.','You worked hard today. God\'s comfort is your reward tonight.','Come to God tired. He offers rest and comfort in return.'],
    '지침_힘'  :['Enduring today was already a great strength. Start fresh tomorrow with renewed energy.','You made it through. That is strength. God will renew you for tomorrow.','Tired but still standing — that is resilience. God honors it.','Getting through a draining day takes real strength. You showed it.','You pushed through exhaustion today. God sees that and honors it.','Strength doesn\'t always look like energy — sometimes it looks like endurance. That was yours today.'],
    '지침_지혜':['Knowing when to stop when you\'re tired is wisdom too. Rest before God tonight.','Wisdom knows when to pause. Tonight is that moment for you.','The wise know their limits. Recognizing your weariness is wisdom.','Stopping when tired is not weakness — it\'s wisdom. Embrace it tonight.','God rested. So should you. That is wisdom, not failure.','Wisdom says: rest now, and return stronger. Listen to that voice.'],
    '지침_쉼'  :['You may rest now. You worked enough, and God will take care of the rest.','You\'ve done your part. Trust God with the rest and go to sleep.','Lay it down. You\'ve given enough for today. Now rest.','Rest is not laziness — it\'s faithfulness to your own God-given limits.','God doesn\'t need you to keep going tonight. He needs you rested.','You worked hard. God has the night watch. Rest well.'],
    '아픔_위로':['God sees your hurting heart up close. You are not alone.','Pain doesn\'t push God away — it draws Him close. He is with you.','You are hurting today, and God is right there beside you.','Your wounds are seen by God. He is the God who heals.','In pain, you are not abandoned. God is your comfort.','Hurt and seen — that\'s where you are. God is beside you in both.'],
    '아픔_힘'  :['The more it hurts, the more you lean on God. That is true strength.','Pain that drives us to God is pain that builds strength.','You hurt today, and yet you\'re still here. That is strength.','Leaning on God in pain is the strongest thing you can do.','Pain reveals what we\'re made of. You\'re made of more than you think.','You\'re hurting, but you haven\'t given up. That is real strength.'],
    '아픔_지혜':['This pain will one day become wisdom that comforts others. Trust God\'s plan.','God wastes nothing — not even pain. This will become something meaningful.','Today\'s hurt is tomorrow\'s wisdom, in God\'s hands.','Pain, when given to God, becomes insight that helps others.','Your wound will one day be a source of empathy and wisdom.','God is already making something from this pain. Trust the process.'],
    '아픔_쉼'  :['If you hurt today, you need to rest fully today. God is beside you.','A hurting heart needs rest. God is near as you sleep tonight.','Don\'t carry pain through the night. Give it to God and rest.','You need rest tonight — not answers, just rest. God will hold it.','Healing begins with rest. Let God hold your pain while you sleep.','It\'s okay to just rest in your pain tonight. God is keeping watch.'],
    '기도_위로':['The very desire to pray is God\'s sign calling you to Him.','Wanting to pray is already reaching toward God. He\'s reaching back.','God placed that desire to pray in you. Follow it — comfort awaits.','The prayer impulse you felt is God drawing you close for comfort.','You wanted to talk to God today. He wanted to talk to you too.','That longing to pray is God\'s invitation. He comforts those who come.'],
    '기도_힘'  :['Prayer is borrowing God\'s strength. Seek that strength tonight.','When you pray, you access strength beyond your own. Use it.','God\'s power is available through prayer. You wanted to pray — do it.','Prayer connects you to infinite strength. That door is open for you now.','You felt drawn to prayer. That\'s the path to real strength.','God gives strength to those who pray. You wanted to pray — now go.'],
    '기도_지혜':['Ask the God who is the source of all wisdom. He will surely answer.','All wisdom comes from God, and prayer is how you access it.','You wanted to pray for wisdom. God is ready to give it generously.','Prayer is the shortcut to God\'s wisdom. Use it tonight.','The wisdom you need is a prayer away. Ask now.','God gives wisdom to all who ask without judgment. Ask boldly.'],
    '기도_쉼'  :['After praying, you may rest. You\'ve entrusted it — now God will work.','Pray, then release. God takes the night shift.','Prayer is how you hand things over. Once handed over, rest.','After you\'ve prayed, you can sleep. God doesn\'t need your help overnight.','Prayer releases the burden. Pray, then rest — fully.','Give it to God in prayer. Then let yourself sleep in peace.']
};
