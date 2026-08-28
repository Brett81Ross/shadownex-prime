/* CactusByte optional live-screen 60-second demo */
(()=>{
  if(document.querySelector('script[data-cactusbyte-demo="shadownex-prime"]'))return;
  const script=document.createElement('script');
  script.src='https://cactusbyte-studios.vercel.app/demo-embed.js';
  script.dataset.cactusbyteDemo='shadownex-prime';
  script.defer=true;
  document.body.appendChild(script);
})();
