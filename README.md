# Wildlife Anatomy Museum

Explore nine animals and the human body in interactive 3D. Rotate each specimen, switch on the labels, and tap the dots to learn what every body part does.

**Live demo:** https://wildlife-anatomy-museum.netlify.app

![Wildlife Anatomy Museum preview](public/og-image.jpg)

## Features

- Ten 3D specimens: lion, elephant, giraffe, kangaroo, tiger, wolf, chimpanzee, hippopotamus, crocodile and human
- Clickable dots on each model that explain a body part, with a Labels button to show or hide them
- Search box and habitat filter for the collection
- Species profile with Overview, Adaptations and Facts tabs
- Model credit shown with every specimen
- First-visit guide, plus a "How it works" button to reopen it any time
- Adjustable text size (A−, A+ and reset, from 90% to 180%) that is remembered between visits
- Works on laptops and phones in both normal and desktop mode, with touch rotate and pinch zoom

## Built with

- React and TypeScript
- Vite
- Tailwind CSS
- Three.js with React Three Fiber and Drei
- Font Awesome (installed offline from npm)
- Deployed on Netlify

## Run it locally

    npm install
    npm run dev

Then open http://localhost:5173

To test on your phone, run `npm run dev -- --host` and open the Network address it prints (phone and laptop on the same Wi-Fi).

To make a production build:

    npm run build

## 3D model credits

The 3D models are third-party work shared under Creative Commons licences. Credit is also shown in the app next to each specimen.

- Lion: "Realistic_Lion 3D_model_of_texture_fbx" by mohamed.salaah880, licensed under CC BY 4.0.
- Elephant: "Elephant" by Stephengury, licensed under CC BY 4.0.
- Giraffe: Giraffe_Textured" by davidgrima, licensed under CC BY 4.0.
- Kangaroo: "Kangaroo" by rinaskylark, licensed under CC BY 4.0.
- Tiger: "Tiger" by Vavtrudner, licensed under CC BY 4.0.
- Wolf: "Wolf" by AX-7YK, licensed under CC BY 4.0.
- Monkey: "chimpanzee Monkey 3d model free" by iRahulRajput, licensed under CC BY 4.0.
- Hippopotamus: "Hippopotamus" by SDPM Esare, licensed under CC BY 4.0.
- Crocodile: "Crocodile 3d model free" by iRahulRajput, licensed under CC BY 4.0.
- Human: "Perfect Human Body" by CAPTAAINRO, licensed under CC BY 4.0.

All models were converted and resized for web display.

## Ideas for later

- A page for each animal
- More specimens and body systems

## Author

Olamide Akinola

- GitHub: https://github.com/OMOAKIN1-devburn
- LinkedIn: https://linkedin.com/in/omoakin1
- Portfolio: https://omoakin1-devburn.github.io/portfolio-website/
