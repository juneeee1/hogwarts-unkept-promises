/** Original synthesized ambience. Audio is only started after a user gesture. */
export class CastleAudio {
  ctx: AudioContext | null=null; master: GainNode | null=null; enabled=false; lastStep=0;
  setEnabled(enabled:boolean) {
    this.enabled=enabled;
    if(enabled&&!this.ctx){
      const Audio = window.AudioContext || (window as unknown as {webkitAudioContext:typeof AudioContext}).webkitAudioContext;
      if(!Audio){this.enabled=false;return;}
      this.ctx=new Audio();const c=this.ctx;this.master=c.createGain();this.master.gain.value=0;this.master.connect(c.destination);
      const buffer=c.createBuffer(1,c.sampleRate*4,c.sampleRate),data=buffer.getChannelData(0);let prev=0;for(let i=0;i<data.length;i++){prev=(prev+(Math.random()*2-1)*.018)/1.018;data[i]=prev*3;}
      const noise=c.createBufferSource();noise.buffer=buffer;noise.loop=true;const filter=c.createBiquadFilter();filter.type='lowpass';filter.frequency.value=280;const gain=c.createGain();gain.gain.value=.21;noise.connect(filter).connect(gain).connect(this.master);noise.start();
      [110,164.81,220.2].forEach((hz,i)=>{const o=c.createOscillator();o.type='sine';o.frequency.value=hz;const g=c.createGain();g.gain.value=.008/(i+1);o.connect(g).connect(this.master!);o.start();});
    }
    if(this.ctx&&this.master){if(enabled)void this.ctx.resume().catch(()=>{});this.master.gain.setTargetAtTime(enabled?.65:0,this.ctx.currentTime,.25);}
  }
  spell() {if(!this.enabled||!this.ctx||!this.master)return;const c=this.ctx;[659.25,987.77,1318.5].forEach((hz,i)=>{const o=c.createOscillator(),g=c.createGain();o.frequency.setValueAtTime(hz*.85,c.currentTime);o.frequency.exponentialRampToValueAtTime(hz,c.currentTime+.15);g.gain.setValueAtTime(0,c.currentTime);g.gain.linearRampToValueAtTime(.05/(i+1),c.currentTime+.04);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+1.5);o.connect(g).connect(this.master!);o.start();o.stop(c.currentTime+1.6);});}
  step(t:number) {if(!this.ctx||!this.master||!this.enabled||t-this.lastStep<.46)return;this.lastStep=t;const c=this.ctx,buffer=c.createBuffer(1,c.sampleRate*.12,c.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*Math.exp(-i/(c.sampleRate*.014))*.15;const src=c.createBufferSource(),filter=c.createBiquadFilter();filter.type='lowpass';filter.frequency.value=520;src.buffer=buffer;src.connect(filter).connect(this.master);src.start();}
  setSuspended(suspended:boolean){if(!this.ctx)return;if(suspended)void this.ctx.suspend().catch(()=>{});else if(this.enabled)void this.ctx.resume().catch(()=>{});}
  dispose(){if(this.ctx)void this.ctx.close();}
}
