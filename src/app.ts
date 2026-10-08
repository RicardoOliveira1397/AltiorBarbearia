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
ScrollTrigger.config({ ignoreMobileResize: true });

@Component({ selector: 'app-root', standalone: true, imports: [FormsModule], templateUrl: './app.html' })
export class AppComponent implements AfterViewInit, OnDestroy {
  year = new Date().getFullYear(); today = new Date().toLocaleDateString('en-CA');
  overlay: 'menu' | 'booking' | null = null;
  name = ''; date = ''; selectedService = 'Corte'; request = ''; copied = false; copyFailed = false;
  activeService = 0; galleryPaused = false; galleryHover = false;
  services = [
    { name: 'Corte', description: 'Forma, textura e personalidade. Feito para você.', image: 'atelier', alt: 'Acabamento de um corte masculino' },
    { name: 'Barba', description: 'Presença no desenho. Precisão no acabamento.', image: 'craft', alt: 'Barba sendo aparada com tesoura' },
    { name: 'Corte + barba', description: 'Seu visual em harmonia. O ritual completo.', image: 'portrait', alt: 'Atendimento com atenção na cadeira do barbeiro' }
  ];
  gallery = [
    { image: 'portrait', title: 'O ENCONTRO', alt: 'Atendimento com tesoura' },
    { image: 'atelier', title: 'A PRECISÃO', alt: 'Acabamento do corte com navalha' },
    { image: 'detail', title: 'O OFÍCIO', alt: 'Instrumentos de barbearia sobre a bancada' },
    { image: 'craft', title: 'O CUIDADO', alt: 'Ritual de barba com tesoura' }
  ];
  menu = [{ id: 'essencia', title: 'A essência' }, { id: 'espaco', title: 'O universo' }, { id: 'rituais', title: 'Os rituais' }, { id: 'visita', title: 'Seu momento' }];
  private lenis?: Lenis; private context?: gsap.Context; private media?: gsap.MatchMedia;
  private splits: SplitText[] = []; private drag?: Draggable;
  private tick?: (time: number, delta: number) => void;
  private galleryState = { x: 0 }; private galleryWidth = 0; private galleryTween?: gsap.core.Tween;
  private galleryDragging = false; private galleryVelocity = 0; private previousFocus?: HTMLElement; private destroyed = false;
  private galleryVisible = false;
  private galleryFocused = false;
  private galleryTick?: (time: number, delta: number) => void;
  private galleryTickAttached = false;
  private galleryWindow?: HTMLElement;
  private setGalleryX?: (x: number) => void;
  private lastGalleryX = Number.NaN;
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
      const percentage = this.query('.loader-percent');
      gsap.timeline().to(progress, { value: 100, duration: 0.55, roundProps: 'value', onUpdate: () => { percentage.textContent = String(progress.value).padStart(2, '0'); } }, 0)
        .to('.loader-line', { scaleX: 1, duration: 0.55 }, 0)
        .to('.loader-word', { yPercent: -15, opacity: 0, duration: 0.55, ease: 'altior-in-out' }, 0.55)
        .to('.loader', { yPercent: -100, duration: 0.85, ease: 'altior-in-out', onComplete: () => { gsap.set('.loader', { display: 'none' }); } }, 0.65);
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
      this.all('.image-reveal').forEach(image => gsap.fromTo(image.querySelector('.image-wipe'), { scaleX: 1 }, { scaleX: 0, duration: 1.4, ease: 'altior-out', scrollTrigger: { trigger: image, start: 'top 85%' } }));
      gsap.fromTo('.essence-small img', { yPercent: -8, scale: 1.2 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.essence-small', start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.fromTo('.closing-image img', { scale: 1.18, yPercent: -10 }, { scale: 1, yPercent: 5, ease: 'none', scrollTrigger: { trigger: '.closing', start: 'top bottom', end: 'bottom top', scrub: true } });
      this.media = gsap.matchMedia();
      this.media.add('(min-width: 900px)', () => {
        const heroScroll = gsap.timeline({ scrollTrigger: { id: 'hero-scene', trigger: '.hero', start: 'top top', end: '+=95%', pin: true, scrub: 0.8, anticipatePin: 1 } });
        heroScroll.to('.hero-center h1', { yPercent: -80, scale: 1.25, opacity: 0, duration: 0.8, ease: 'none' }, 0)
          .to('.hero-script', { xPercent: 35, yPercent: 65, opacity: 0, duration: 0.6 }, 0)
          .to('.hero-bottom, .hero-kicker, .hero-side', { opacity: 0, duration: 0.4 }, 0)
          .to('.hero-matte-horizontal', { scaleX: 1, duration: 1, ease: 'none' }, 0)
          .to('.hero-matte-vertical', { scaleY: 1, duration: 1, ease: 'none' }, 0)
          .to('.hero-image img', { scale: 1.13, duration: 1, ease: 'none' }, 0)
          .to('.hero-frame', { opacity: 0, duration: 0.5 }, 0);
        const track = this.query('.story-track');
        const counter = this.query('.story-count');
        const setProgress = gsap.quickSetter(this.query('.story-progress span'), 'scaleX');
        let chapter = 1;
        const horizontal = gsap.to(track, { x: () => -(track.scrollWidth - innerWidth), ease: 'none', scrollTrigger: { id: 'story-scene', trigger: '.story', start: 'top top', end: () => '+=' + (track.scrollWidth - innerWidth), scrub: 0.8, pin: true, anticipatePin: 1, invalidateOnRefresh: true, onUpdate: self => {
          const next = Math.min(3, Math.floor(self.progress * 3) + 1);
          if (next !== chapter) { chapter = next; counter.textContent = '0' + chapter + ' — 03'; }
          setProgress(self.progress);
        } } });
        this.all('.lateral-word').forEach((word, i) => gsap.fromTo(word, { x: i % 2 ? 45 : -35 }, { x: i % 2 ? -45 : 35, ease: 'none', scrollTrigger: { trigger: word, containerAnimation: horizontal, start: 'left right', end: 'right left', scrub: true } }));
        gsap.fromTo('.story-portrait img', { scale: 1.15, xPercent: -8 }, { xPercent: 8, ease: 'none', scrollTrigger: { trigger: '.story-portrait', containerAnimation: horizontal, start: 'left right', end: 'right left', scrub: true } });
      });
      this.media.add('(max-width: 899px)', () => {
        gsap.to('.hero-image img', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
        this.all('.story-panel h2').forEach(heading => gsap.from(heading, { y: 50, opacity: 0, duration: 1, scrollTrigger: { trigger: heading, start: 'top 90%' } }));
      });
      this.setupGallery(); this.setupMagneticButtons();
    }, this.element.nativeElement);
    this.tick = time => this.lenis?.raf(time * 1000);
    gsap.ticker.add(this.tick); ScrollTrigger.refresh();
    const initialId = location.hash.slice(1);
    if (initialId && this.element.nativeElement.querySelector('#' + CSS.escape(initialId))) {
      const scene = initialId === 'espaco' ? ScrollTrigger.getById('story-scene') : undefined;
      this.lenis.scrollTo(scene ? scene.start + 1 : this.query<HTMLElement>('#' + CSS.escape(initialId)), { immediate: true });
    }
  }
  private cleanup: (() => void)[] = [];
  private setupGallery() {
    const group = this.query('.gallery-group');
    const belt = this.query('.gallery-belt');
    this.galleryWindow = this.query('.gallery-window');
    gsap.set(belt, { force3D: true });
    this.setGalleryX = gsap.quickSetter(belt, 'x', 'px') as (x: number) => void;
    this.lastGalleryX = Number.NaN;
    const measure = () => { this.galleryWidth = group.getBoundingClientRect().width; this.lastGalleryX = Number.NaN; this.renderGallery(); };
    measure();
    const observer = new ResizeObserver(measure); observer.observe(group);
    this.galleryTick = (_time, delta) => {
      if (this.galleryTween?.isActive()) return;
      const elapsed = Math.min(delta, 40);
      if (!this.galleryPaused && !this.galleryHover && !this.galleryFocused) this.galleryState.x -= elapsed * 0.023;
      if (Math.abs(this.galleryVelocity) > 0.1) {
        this.galleryState.x += this.galleryVelocity * elapsed / 16.667;
        this.galleryVelocity *= Math.pow(0.92, elapsed / 16.667);
      }
      this.renderGallery();
      this.syncGalleryTicker();
    };
    const visibility = new IntersectionObserver(entries => {
      this.galleryVisible = entries[0].isIntersecting;
      this.galleryWindow?.classList.toggle('is-visible', this.galleryVisible);
      this.renderGallery();
      this.syncGalleryTicker();
    }, { rootMargin: '120px 0px' });
    visibility.observe(this.galleryWindow);
    const onVisibility = () => this.syncGalleryTicker();
    document.addEventListener('visibilitychange', onVisibility);
    this.cleanup.push(() => { observer.disconnect(); visibility.disconnect(); document.removeEventListener('visibilitychange', onVisibility); });
    const app = this; const proxy = document.createElement('div');
    this.drag = Draggable.create(proxy, { type: 'x', trigger: this.galleryWindow, allowNativeTouchScrolling: true, dragClickables: true,
      onPress() { app.galleryDragging = true; app.galleryTween?.kill(); app.galleryVelocity = 0; app.syncGalleryTicker(); },
      onDrag() { app.galleryState.x += this.deltaX; app.galleryVelocity = this.deltaX; app.renderGallery(); },
      onRelease() { app.galleryDragging = false; app.syncGalleryTicker(); }
    })[0];
  }
  private syncGalleryTicker() {
    const active = this.galleryVisible && !document.hidden && !this.overlay && !this.reduced.matches && !this.galleryDragging &&
      ((!this.galleryPaused && !this.galleryHover && !this.galleryFocused) || Math.abs(this.galleryVelocity) > 0.1);
    if (active !== this.galleryTickAttached && this.galleryTick) {
      if (active) gsap.ticker.add(this.galleryTick); else gsap.ticker.remove(this.galleryTick);
      this.galleryTickAttached = active;
    }
  }
  private renderGallery() {
    if (!this.galleryWidth || !this.galleryVisible || document.hidden || this.overlay) return;
    const x = gsap.utils.wrap(-this.galleryWidth, 0, this.galleryState.x);
    if (x !== this.lastGalleryX) { this.setGalleryX?.(x); this.lastGalleryX = x; }
  }
  moveGallery(direction: number) {
    if (this.reduced.matches) { this.query('.gallery-window').scrollBy({ left: direction * 320, behavior: 'auto' }); return; }
    this.galleryVelocity = 0; this.galleryTween?.kill();
    this.zone.runOutsideAngular(() => { this.galleryTween = gsap.to(this.galleryState, { x: this.galleryState.x - direction * Math.min(innerWidth * 0.4, 550), duration: 0.8, ease: 'altior-out', onUpdate: () => this.renderGallery() }); });
  }
  toggleGallery() { this.galleryPaused = !this.galleryPaused; this.galleryVelocity = 0; this.syncGalleryTicker(); }
  setGalleryHover(value: boolean) { this.galleryHover = value; this.syncGalleryTicker(); }
  setGalleryFocus(value: boolean) { this.galleryFocused = value; this.syncGalleryTicker(); }
  private setupMagneticButtons() {
    if (!matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    this.all('.magnetic').forEach(button => {
      const xTo = gsap.quickTo(button, 'x', { duration: 0.6, ease: 'power2.out' });
      const yTo = gsap.quickTo(button, 'y', { duration: 0.6, ease: 'power2.out' });
      let centerX = 0, centerY = 0;
      const enter = () => { const box = button.getBoundingClientRect(); centerX = box.left + box.width / 2; centerY = box.top + box.height / 2; };
      const move = (event: MouseEvent) => { xTo((event.clientX - centerX) * 0.22); yTo((event.clientY - centerY) * 0.22); };
      const leave = () => { xTo(0); yTo(0); };
      button.addEventListener('mouseenter', enter); button.addEventListener('mousemove', move); button.addEventListener('mouseleave', leave);
      this.cleanup.push(() => { button.removeEventListener('mouseenter', enter); button.removeEventListener('mousemove', move); button.removeEventListener('mouseleave', leave); xTo.tween.kill(); yTo.tween.kill(); });
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
    this.syncGalleryTicker();
    this.zone.runOutsideAngular(() => {
      if (!this.reduced.matches) {
        this.overlayAnimation = gsap.timeline().fromTo('.overlay', { opacity: 0 }, { opacity: 1, duration: 0.35 }).fromTo('.overlay-panel', { yPercent: 100 }, { yPercent: 0, duration: 0.85, ease: 'altior-out' }, 0);
        if (type === 'menu') this.overlayAnimation.fromTo('.menu-content nav a', { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.7 }, 0.2);
      }
    });
    this.query<HTMLButtonElement>('.overlay-close').focus();
  }
  async closeOverlay(restoreFocus = true) {
    if (!this.overlay) return; this.overlayAnimation?.kill(); if (!this.reduced.matches) await gsap.to('.overlay', { opacity: 0, duration: 0.25 });
    this.zone.run(() => { this.overlay = null; this.cd.detectChanges(); }); this.lenis?.start(); document.body.style.overflow = ''; this.syncGalleryTicker(); if (restoreFocus) this.previousFocus?.focus();
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
  private disposeMotion() {
    this.galleryTween?.kill(); this.drag?.kill();
    if (this.galleryTick) gsap.ticker.remove(this.galleryTick);
    this.galleryTickAttached = false; this.galleryVisible = false; this.setGalleryX = undefined;
    this.galleryWindow?.classList.remove('is-visible');
    this.media?.revert(); this.context?.revert(); this.splits.forEach(split => split.revert()); this.splits = [];
    this.cleanup.forEach(fn => fn()); this.cleanup = [];
    if (this.tick) gsap.ticker.remove(this.tick);
    this.lenis?.destroy(); this.lenis = undefined;
  }
  ngOnDestroy() { this.destroyed = true; this.reduced.removeEventListener('change', this.reduceHandler); this.disposeMotion(); this.overlayAnimation?.kill(); document.body.style.overflow = ''; }
}
