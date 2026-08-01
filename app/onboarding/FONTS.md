## フォント読み込み

app/layout.tsx の <head> または globals.css に以下を追加:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Noto+Serif+JP:wght@200;300&display=swap" rel="stylesheet">
```

または next/font/google で:

```ts
import { Cormorant_Garamond, Noto_Serif_JP } from 'next/font/google';

const cormorant = Cormorant_Garamond({ weight: ['300','400'], style:['normal','italic'], subsets: ['latin'] });
const notoSerifJP = Noto_Serif_JP({ weight: ['200','300'], subsets: ['latin'] });
```
