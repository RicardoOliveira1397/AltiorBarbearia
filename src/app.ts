import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, NgZone, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { CustomEase } from 'gsap/CustomEase';
import { Draggable } from 'gsap/Draggable';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase, Draggable);
CustomEase.create('altior-out', '0.22,1,0.36,1');
CustomEase.create('altior-in-out', '0.76,0,0.24,1');

@Component({ selector: 'app-root', standalone: true, imports: [FormsModule], templateUrl: './app.html' })
export class AppComponent implements AfterViewInit, OnDestroy {
  year = new Date().getFullYear(); today = new Date().toLocaleDateString('en-CA');
  overlay: 'menu' | 'booking' | null = null;
  name = ''; date = ''; selectedService = 'Corte'; request = ''; copied = false; copyFailed = false;
  activeService = 0; galleryPaused = false; galleryHover = false;
  services = [
    { name: 'Corte', description: 'Forma, textura e personalidade. Feito para você.', image: 'images/atelier.jpg', alt: 'Acabamento de um corte masculino' },
    { name: 'Barba', description: 'Presença no desenho. Precisão no acabamento.', image: 'images/craft.jpg', alt: 'Barba sendo aparada com tesoura' },
    { name: 'Corte + barba', description: 'Seu visual em harmonia. O ritual completo.', image: 'images/portrait.jpg', alt: 'Atendimento com atenção na cadeira do barbeiro' }
  ];
  gallery = [
    { image: 'images/portrait.jpg', title: 'O ENCONTRO', alt: 'Atendimento com tesoura' },
    { image: 'images/atelier.jpg', title: 'A PRECISÃO', alt: 'Acabamento do corte com navalha' },
    { image: 'images/detail.jpg', title: 'O OFÍCIO', alt: 'Instrumentos de barbearia sobre a bancada' },
    { image: 'images/craft.jpg', title: 'O CUIDADO', alt: 'Ritual de barba com tesoura' }
  ];
  menu = [{ id: 'essencia', title: 'A essência' }, { id: 'espaco', title: 'O universo' }, { id: 'rituais', title: 'Os rituais' }, { id: 'visita', title: 'Seu momento' }];
  private lenis?: Lenis; private context?: gsap.Context; private media?: gsap.MatchMedia;
  private splits: SplitText[] = []; private drag?: Draggable;
  private tick?: (time: number, delta: number) => void;
  private galleryState = { x: 0 }; private galleryWidth = 0; private galleryTween?: gsap.core.Tween;
  private galleryDragging = false; private galleryVelocity = 0; private previousFocus?: HTMLElement; private destroyed = false;
  private overlayAnimation?: gsap.core.Timeline;
  private reduced = matchMedia('(prefers-reduced-motion: reduce)');
  private reduceHandler = () => { this.disposeMotion(); this.zone.runOutsideAngular(() => this.setupMotion()); };

  constructor(private element: ElementRef<HTMLElement>, private zone: NgZone, private cd: ChangeDetectorRef) {}
  private query<T extends Element = HTMLElement>(selector: string) { return this.element.nativeElement.querySelector<T>(selector)!; }
  private all(selector: string) { return Array.from(this.element.nativeElement.querySelectorAll<HTMLElement>(selector)); }

  async ngAfterViewInit() {
    this.reduced.addEventListener('change', this.reduceHandler);
    const heroImage = this.query<HTMLImageElement>('.hero-image img');
    await Promise.race([Promise.allSettled([document.fonts.ready, heroImage.decode()]), new Promise(resolve => setTimeout(resolve, 2200))]);
    if (this.destroyed) return;
    this.zone.runOutsideAngular(() => {
      this.setupMotion();
      if (this.reduced.matches) { gsap.set('.loader', { display: 'none' }); return; }
      const progress = { value: 0 };
      gsap.timeline().to(progress, { value: 100, duration: 0.55, roundProps: 'value', onUpdate: () => { this.query('.loader-percent').textContent = String(progress.value).padStart(2, '0'); } }, 0)
        .to('.loader-line', { scaleX: 1, duration: 0.55 }, 0)
        .to('.loader-word', { yPercent: -15, opacity: 0, duration: 0.55, ease: 'altior-in-out' }, 0.55)
        .to('.loader', { clipPath: 'inset(0 0 100% 0)', duration: 0.85, ease: 'altior-in-out', onComplete: () => { gsap.set('.loader', { display: 'none' }); ScrollTrigger.refresh(); } }, 0.65);
    });
  }

  private setupMotion() {
    if (this.reduced.matches) return;
    this.lenis = new Lenis({ duration: 1.15, smoothWheel: true, anchors: false }); this.lenis.on('scroll', ScrollTrigger.update);
    if (this.overlay) this.lenis.stop();
    this.context = gsap.context(() => {
      const heroSplit = SplitText.create('.hero-center h1', { type: 'chars', mask: 'chars', aria: 'auto' }); this.splits.push(heroSplit);
      gsap.from(heroSplit.chars, { yPercent: 110, rotate: 8, stagger: 0.07, duration: 1.45, delay: 0.75, ease: 'altior-out' });
      // Animate the inner subtitle, keeping its parent independent of the scroll timeline.
      gsap.from('.hero-script span', { y: 50, opacity: 0, duration: 1.6, delay: 1.1, ease: 'altior-out' });
      gsap.to('.scroll-progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: true } });
      this.all('.split-heading').forEach(heading => {
        const split = SplitText.create(heading, { type: 'lines,words', mask: 'lines', autoSplit: true, aria: 'auto', onSplit: self => gsap.from(self.words, { yPercent: 115, rotate: 3, stagger: 0.045, duration: 1.15, ease: 'altior-out', scrollTrigger: { trigger: heading, start: 'top 88%', toggleActions: 'play none none reverse' } }) }); this.splits.push(split);
      });
      const statement = SplitText.create('.word-reveal', { type: 'words', aria: 'auto' }); this.splits.push(statement);
      gsap.from(statement.words, { opacity: 0.16, stagger: 0.16, ease: 'none', scrollTrigger: { trigger: '.word-reveal', start: 'top 80%', end: 'bottom 42%', scrub: 0.5 } });
      this.all('.image-reveal').forEach(image => gsap.from(image, { clipPath: 'inset(12% 0 12% 100%)', duration: 1.4, ease: 'altior-out', scrollTrigger: { trigger: image, start: 'top 85%' } }));
      gsap.fromTo('.essence-small img', { yPercent: -8, scale: 1.2 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.essence-small', start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.fromTo('.closing-image img', { scale: 1.18, yPercent: -10 }, { scale: 1, yPercent: 5, ease: 'none', scrollTrigger: { trigger: '.closing', start: 'top bottom', end: 'bottom top', scrub: true } });
      this.media = gsap.matchMedia();
      this.media.add('(min-width: 900px)', () => {
        const heroScroll = gsap.timeline({ scrollTrigger: { id: 'hero-scene', trigger: '.hero', start: 'top top', end: '+=95%', pin: true, scrub: 0.8, anticipatePin: 1 } });
        heroScroll.to('.hero-center h1', { yPercent: -80, scale: 1.25, opacity: 0, duration: 0.8, ease: 'none' }, 0)
          .to('.hero-script', { xPercent: 35, yPercent: 65, opacity: 0, duration: 0.6 }, 0)
          .to('.hero-bottom, .hero-kicker, .hero-side', { opacity: 0, duration: 0.4 }, 0)
          .to('.hero-image', { clipPath: 'inset(7% 13% 7% 13%)', duration: 1, ease: 'none' }, 0)
          .to('.hero-image img', { scale: 1.13, duration: 1, ease: 'none' }, 0)
          .to('.hero-frame', { opacity: 0, duration: 0.5 }, 0);
        const track = this.query('.story-track');
        const horizontal = gsap.to(track, { x: () => -(track.scrollWidth - innerWidth), ease: 'none', scrollTrigger: { id: 'story-scene', trigger: '.story', start: 'top top', end: () => '+=' + (track.scrollWidth - innerWidth), scrub: 0.8, pin: true, anticipatePin: 1, invalidateOnRefresh: true, onUpdate: self => { this.query('.story-count').textContent = '0' + Math.min(3, Math.floor(self.progress * 3) + 1) + ' — 03'; gsap.set('.story-progress span', { scaleX: self.progress }); } } });
        this.all('.lateral-word').forEach((word, i) => gsap.fromTo(word, { x: i % 2 ? 45 : -35 }, { x: i % 2 ? -45 : 35, ease: 'none', scrollTrigger: { trigger: word, containerAnimation: horizontal, start: 'left right', end: 'right left', scrub: true } }));
        gsap.fromTo('.story-portrait img', { scale: 1.15, xPercent: -8 }, { xPercent: 8, ease: 'none', scrollTrigger: { trigger: '.story-portrait', containerAnimation: horizontal, start: 'left right', end: 'right left', scrub: true } });
      });
      this.media.add('(max-width: 899px)', () => {
        gsap.to('.hero-image img', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
        this.all('.story-panel h2').forEach(heading => gsap.from(heading, { y: 50, opacity: 0, duration: 1, scrollTrigger: { trigger: heading, start: 'top 90%' } }));
      });
      this.setupGallery(); this.setupMagneticButtons();
    }, this.element.nativeElement);
    this.tick = (time, delta) => {
      this.lenis?.raf(time * 1000);
      if (this.galleryWidth && !this.galleryPaused && !this.galleryHover && !this.galleryDragging && !this.galleryTween?.isActive()) this.galleryState.x -= Math.min(delta, 40) * 0.023;
      if (!this.galleryDragging && !this.galleryTween?.isActive() && Math.abs(this.galleryVelocity) > 0.1) { this.galleryState.x += this.galleryVelocity; this.galleryVelocity *= 0.92; }
      this.renderGallery();
    };
    gsap.ticker.add(this.tick); ScrollTrigger.refresh();
    const initialId = location.hash.slice(1);
    if (initialId && this.element.nativeElement.querySelector('#' + CSS.escape(initialId))) {
      const scene = initialId === 'espaco' ? ScrollTrigger.getById('story-scene') : undefined;
      this.lenis.scrollTo(scene ? scene.start + 1 : this.query<HTMLElement>('#' + CSS.escape(initialId)), { immediate: true });
    }
  }
  private cleanup: (() => void)[] = [];
  private setupGallery() {
    const measure = () => { this.galleryWidth = this.query('.gallery-group').getBoundingClientRect().width; }; measure();
    const observer = new ResizeObserver(measure); observer.observe(this.query('.gallery-group')); this.cleanup.push(() => observer.disconnect());
    const app = this; const proxy = document.createElement('div');
    this.drag = Draggable.create(proxy, { type: 'x', trigger: this.query('.gallery-window'), allowNativeTouchScrolling: true, dragClickables: true,
      onPress() { app.galleryDragging = true; app.galleryTween?.kill(); app.galleryVelocity = 0; },
      onDrag() { app.galleryState.x += this.deltaX; app.galleryVelocity = this.deltaX; app.renderGallery(); },
      onRelease() { app.galleryDragging = false; }
    })[0];
  }
  private renderGallery() { if (this.galleryWidth) gsap.set(this.query('.gallery-belt'), { x: gsap.utils.wrap(-this.galleryWidth, 0, this.galleryState.x) }); }
  moveGallery(direction: number) {
    if (this.reduced.matches) { this.query('.gallery-window').scrollBy({ left: direction * 320, behavior: 'auto' }); return; }
    this.galleryVelocity = 0; this.galleryTween?.kill(); this.galleryTween = gsap.to(this.galleryState, { x: this.galleryState.x - direction * Math.min(innerWidth * 0.4, 550), duration: 0.8, ease: 'altior-out', onUpdate: () => this.renderGallery() });
  }
  toggleGallery() { this.galleryPaused = !this.galleryPaused; this.galleryVelocity = 0; }
  private setupMagneticButtons() {
    if (!matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    this.all('.magnetic').forEach(button => {
      const move = (event: MouseEvent) => { const box = button.getBoundingClientRect(); gsap.to(button, { x: (event.clientX - box.left - box.width / 2) * 0.22, y: (event.clientY - box.top - box.height / 2) * 0.22, duration: 0.6, ease: 'power2.out' }); };
      const leave = () => { gsap.to(button, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1,0.4)' }); };
      button.addEventListener('mousemove', move); button.addEventListener('mouseleave', leave); this.cleanup.push(() => { button.removeEventListener('mousemove', move); button.removeEventListener('mouseleave', leave); });
    });
  }
  selectService(index: number) { this.activeService = index; }
  async navigate(event: Event, id: string) {
    event.preventDefault(); if (this.overlay) await this.closeOverlay(false);
    const target = this.query('#' + id); const scene = id === 'espaco' ? ScrollTrigger.getById('story-scene') : undefined;
    if (this.lenis) this.lenis.scrollTo(id === 'inicio' ? 0 : scene ? scene.start + 1 : target, { duration: 1.6, offset: 0 }); else target.scrollIntoView({ behavior: this.reduced.matches ? 'instant' : 'smooth' });
    history.replaceState(null, '', '#' + id);
  }
  openMenu() { this.openOverlay('menu'); }
  openBooking(service = 'Corte') { this.selectedService = service; this.request = ''; this.copied = false; this.copyFailed = false; this.openOverlay('booking'); }
  private openOverlay(type: 'menu' | 'booking') {
    this.overlayAnimation?.kill(); if (!this.overlay) this.previousFocus = document.activeElement as HTMLElement;
    this.overlay = type; this.lenis?.stop(); document.body.style.overflow = 'hidden'; this.cd.detectChanges();
    this.zone.runOutsideAngular(() => {
      if (!this.reduced.matches) this.overlayAnimation = gsap.timeline().fromTo('.overlay', { opacity: 0 }, { opacity: 1, duration: 0.35 }).fromTo('.overlay-panel', { yPercent: 100 }, { yPercent: 0, duration: 0.85, ease: 'altior-out' }, 0).fromTo('.menu-content nav a', { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.7 }, 0.2);
    });
    this.query<HTMLButtonElement>('.overlay-close').focus();
  }
  async closeOverlay(restoreFocus = true) {
    if (!this.overlay) return; this.overlayAnimation?.kill(); if (!this.reduced.matches) await gsap.to('.overlay', { opacity: 0, duration: 0.25 });
    this.zone.run(() => { this.overlay = null; this.cd.detectChanges(); }); this.lenis?.start(); document.body.style.overflow = ''; if (restoreFocus) this.previousFocus?.focus();
  }
  @HostListener('document:keydown', ['$event'])
  onKey(event: KeyboardEvent) {
    if (!this.overlay) return;
    if (event.key === 'Escape') { void this.closeOverlay(); return; }
    if (event.key === 'Tab') {
      const items = this.all('.overlay button, .overlay a, .overlay input, .overlay select').filter(el => !el.hasAttribute('disabled'));
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  }
  prepareRequest() { if (!this.name.trim() || !this.date || this.date < this.today) return; this.request = `Olá, Altior! Sou ${this.name.trim()}. Gostaria de consultar disponibilidade para ${this.selectedService.toLowerCase()} no dia ${this.date.split('-').reverse().join('/')}. Quais horários e valores estão disponíveis?`; }
  async copyRequest() { try { await navigator.clipboard.writeText(this.request); this.copied = true; this.copyFailed = false; } catch { this.copyFailed = true; } }
  private disposeMotion() { this.galleryTween?.kill(); this.drag?.kill(); this.media?.revert(); this.context?.revert(); this.splits.forEach(split => split.revert()); this.splits = []; this.cleanup.forEach(fn => fn()); this.cleanup = []; if (this.tick) gsap.ticker.remove(this.tick); this.lenis?.destroy(); this.lenis = undefined; }
  ngOnDestroy() { this.destroyed = true; this.reduced.removeEventListener('change', this.reduceHandler); this.disposeMotion(); this.overlayAnimation?.kill(); document.body.style.overflow = ''; }
}
