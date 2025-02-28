if(navigator.serviceWorker){
  navigator.serviceWorker.register('service_worker.js')
  .then((reg)=> {
      console.log("file is register", reg)
  })
  .catch((err)=>{
      console.log("error", err)
  })
}


//INSATALL BUTTON
const inst = document.querySelector('#install');
window.addEventListener("beforeinstallprompt", (installEvent)=>{
  installEvent.preventDefault;
  inst.style.display ='block';
  deferredPromt = installEvent;
} )
inst.addEventListener("click", ()=>{
  if(deferredPromt){
      deferredPromt.prompt();
      deferredPromt.userChoice.then((choiceResult=>{
          if(choiceResult.outcome === 'accepted'){
              console.log("user accepted installing");
              inst.style.display = "none";
          }else{
              console.log("user refused installing")
          }
      }))
  }
}) 
  
