import React, {useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import seed from '../catalog-data.json';
import './editor.css';
import './style.css';

const originals = import.meta.glob([
  '../product-images/баннеры/гранат*/1.jpg', '../product-images/мыльные пузыри/2.jpg',
  '../product-images/маки/2.jpg', '../product-images/точка равновесия/1.jpg',
  '../product-images/предметы искусства/1.jpg'
], {eager: true, query: '?url', import: 'default'});
const defaults = seed.map(item => {
  const folder = '/' + item.title.normalize('NFC').toLowerCase() + '/';
  const image = Object.entries(originals).find(([path]) => path.normalize('NFC').includes(folder))?.[1];
  return {...item, image, shortDescription: 'Авторское украшение из коллекции «' + item.title + '».', published: true, initial: true};
});
const KEY='milutin-demo-cards-v1';
const HIDDEN_KEY='milutin-hidden-initial-cards-v1';
function readHiddenCards(){ try { const value=JSON.parse(localStorage.getItem(HIDDEN_KEY) || '[]'); return Array.isArray(value) ? value : []; } catch { return []; } }
function readCards(){ try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch {return [];} }
const roman = n => { const pairs=[[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']]; let result=''; for(const [value, symbol] of pairs) while(n>=value){result+=symbol;n-=value;} return result; };
const crops = import.meta.glob('../assets/display/{teal,wine,poppy,divider,fleur,finial,garnet,bubbles,poppies,balance,objects,necklace}.webp', {eager:true, query:'?url', import:'default'});
const displayImage = name => crops[`../assets/display/${name}.webp`];
const coverNames = {
  'garnat-mnogogrannyy': 'garnet', 'mylnye-puzyri': 'bubbles', maki: 'poppies',
  'tochka-ravnovesiya': 'balance', 'predmety-iskusstva': 'objects'
};
const frameNames = {'mylnye-puzyri':'wine', maki:'poppy'};
const templateFrames = {arch:'teal', portrait:'wine', wide:'poppy'};

function Ornament({kind = 'divider'}) {
  return <img className={'ornament ornament--' + kind} src={displayImage(kind)} alt="" aria-hidden="true"/>;
}

function Card({item, index = 0, onClick, preview = false}) {
  const title = item.title.trim() || 'Название изделия';
  const cover = item.initial ? displayImage(coverNames[item.slug]) : item.image;
  const frame = (item.initial && frameNames[item.slug]) || templateFrames[item.template];
  const wide = item.template === 'wide';
  return (
    <article className={`card card--${item.template}`}>
      <button type="button" className="card-button" onClick={onClick} disabled={preview} aria-label={'Подробнее о коллекции «' + title + '»'}>
        <span className="card-number" aria-hidden="true">{roman(index + 1)}</span>
        <span className="card-frame" data-frame={frame}>
          <span className="card-aperture"><span className={'card-photo' + (item.initial ? '' : ' card-photo--uploaded')}>
            <img src={cover || item.image} alt="" loading="lazy"/>
          </span></span>
          <img className="frame-art" src={displayImage(frame)} alt="" loading="lazy"/>
          <span className="frame-caption">
            <span className="caption-initial" aria-hidden="true">{title[0]}</span>
            <span className="caption-copy"><strong>{title}</strong><small>{item.materials || 'Материалы изделия'}</small></span>
          </span>
        </span>
        {wide && <span className="wide-copy"><Ornament kind="fleur"/><strong>{title}</strong><span>{item.materials}</span><Ornament/></span>}
      </button>
    </article>
  );
}

function ContactLink({title}) {
  const email = import.meta.env.VITE_ATELIER_EMAIL?.trim();
  const label = title ? 'Уточнить наличие' : 'Связаться с ателье';
  if (email) {
    const subject = title ? 'Уточнить наличие · ' + title : 'Запись в ателье';
    return <a className="text-link" href={'mailto:' + email + '?subject=' + encodeURIComponent(subject)}>{label} ↗</a>;
  }
  return <details className="contact-details"><summary className="text-link">{label}</summary>
    <p>Это демонстрационный каталог. Контакты ателье появятся при публикации.</p></details>;
}

function Modal({item, onClose}) {
  const ref = React.useRef(null);
  useEffect(() => {
    if (item) ref.current.showModal();
    else if (ref.current.open) ref.current.close();
  }, [item]);
  return (
    <dialog ref={ref} className="modal" aria-labelledby="modal-title" onClose={onClose} onClick={e => {if(e.target === ref.current) onClose()}}>
      {item && <div className="modal-body">
        <button className="modal-close" type="button" onClick={onClose} aria-label="Закрыть">×</button>
        <img className="modal-product" src={item.image} alt={item.title}/>
        <div className="modal-copy"><span className="eyebrow">Авторская коллекция</span><h2 id="modal-title">{item.title}</h2><Ornament/>
        <p>{item.materials}</p><p>{item.shortDescription}</p><ContactLink title={item.title}/></div>
      </div>}
    </dialog>
  );
}

const navigation = [['Коллекции','collections'],['Мастерская','atelier'],['Об авторе','about'],['Процесс','process'],['Ателье','appointment'],['Контакты','contacts']];

function Hero({onSelect}) {
  const [menu, setMenu] = useState(false);
  return (
    <header className="hero" id="top" onKeyDown={e => {if(e.key==='Escape') setMenu(false)}}>
      <nav className="nav" aria-label="Основная навигация">
        <a href="#top" className="monogram" aria-label="Михаил Милютин, в начало">М</a>
        <button className="menu-toggle" type="button" aria-expanded={menu} aria-controls="nav-links" onClick={()=>setMenu(!menu)}>{menu?'Закрыть':'Меню'}<span className="menu-icon" aria-hidden="true"/></button>
        <div id="nav-links" className={'nav-links' + (menu?' is-open':'')}>{navigation.map(([label,id])=><a key={label} href={'#'+id} onClick={()=>setMenu(false)}>{label}</a>)}</div>
      </nav>
      <div className="hero-heading"><h1><span>Михаил</span><span>Милютин</span></h1><Ornament/><p>Драгоценности<br/>вне времени</p></div>
      <button disabled={!onSelect} className="hero-jewel" type="button" onClick={onSelect} aria-label="Посмотреть колье «Гранат многогранный»"><img src={displayImage('necklace')} alt="Колье из разноцветных гранатов" fetchPriority="high"/></button>
      <div className="hero-side hero-side--left" aria-hidden="true"><span>ММ</span><Ornament kind="finial"/><span>Москва</span></div>
      <div className="hero-side hero-side--right" aria-hidden="true"><span>Форма<br/>и материя</span><Ornament kind="finial"/><span>Ателье</span></div>
      <a className="hero-seal" href="#collections" aria-label="К коллекциям"><Ornament kind="fleur"/></a>
    </header>
  );
}

function Storefront() {
  const [selected, setSelected] = useState(null);
  const hidden = readHiddenCards();
  const cards = [...defaults,...readCards()].filter(x=>x.published && !hidden.includes(x.slug)).sort((a,b)=>a.sortOrder-b.sortOrder);
  return (
    <div className="storefront">
      <Hero onSelect={hidden.includes(defaults[0].slug) ? undefined : ()=>setSelected(defaults[0])}/>
      <main>
        <section className="catalog" id="collections" aria-labelledby="collections-title">
          <div className="section-title"><Ornament/><h2 id="collections-title">Коллекции</h2><Ornament/></div>
          {!cards.length && <p className="catalog-empty">Коллекции пока не опубликованы.</p>}
          <div className="catalog-grid">{cards.map((item,i)=><Card key={item.slug} item={item} index={i} onClick={()=>setSelected(item)}/>)}</div>
        </section>
        <section className="story" id="atelier"><Ornament kind="fleur"/><span className="eyebrow" id="about">Мастерская Михаила Милютина</span>
          <h2>Красота в деталях</h2><p id="process">Авторские украшения — это диалог формы, материала и мастерства. Каждая коллекция раскрывает собственную историю.</p>
          <a href="#contacts" className="text-link">Связаться с ателье ↗</a>
        </section>
      </main>
      <footer id="contacts"><a href="#collections">Каталог</a><a href="/editor">Демо редактора</a><span className="footer-signature" id="appointment"><Ornament/>Москва · По записи<Ornament/></span><ContactLink/><a href="#top">Наверх ↑</a></footer>
      <Modal item={selected} onClose={()=>setSelected(null)}/>
    </div>
  );
}
const empty={title:'',slug:'',template:'arch',image:'',materials:'',shortDescription:'',sortOrder:6,published:true};
function Editor(){const [cards,setCards]=useState(readCards),[hidden,setHidden]=useState(readHiddenCards),[form,setForm]=useState(empty),[editing,setEditing]=useState(false),[error,setError]=useState('');function save(e){e.preventDefault();if(!form.image){setError('Загрузите главное фото изделия.');return}if([...defaults,...cards].some(c=>c.slug===form.slug)){setError('Такой slug уже используется.');return}const next=[...cards,{...form,sortOrder:Number(form.sortOrder)}];try{localStorage.setItem(KEY,JSON.stringify(next));setCards(next);setForm(empty);setEditing(false);setError('')}catch{setError('Не удалось сохранить фото: возможно, в браузере закончилось место. Попробуйте файл меньшего размера.')}}function remove(slug){if(defaults.some(c=>c.slug===slug)){const next=[...hidden,slug];localStorage.setItem(HIDDEN_KEY,JSON.stringify(next));setHidden(next);return}const next=cards.filter(c=>c.slug!==slug);localStorage.setItem(KEY,JSON.stringify(next));setCards(next)}function reset(){if(window.confirm('Удалить добавленные карточки и восстановить исходные?')){localStorage.removeItem(KEY);localStorage.removeItem(HIDDEN_KEY);setCards([]);setHidden([]);setForm(empty);setEditing(false)}}function update(e){const {name,value,type,checked}=e.target;setForm({...form,[name]:type==='checkbox'?checked:value})}function upload(e){const file=e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=()=>setForm(f=>({...f,image:reader.result}));reader.readAsDataURL(file)}return <div className="editor"><header className="editor-header"><a href="/" className="editor-brand">М <span>МИЛЮТИН / ДЕМО</span></a><a href="/" className="editor-view">Открыть каталог ↗</a></header><main className="editor-main"><div className="editor-title"><div><span className="editor-kicker">РАБОЧЕЕ ПРОСТРАНСТВО</span><h1>Редактор каталога</h1><p>Добавляйте изделия в готовую визуальную систему.</p></div><button className="primary" onClick={()=>{setEditing(true);setForm(empty);setError('')}}>＋ Добавить изделие</button></div><div className="editor-note">Демонстрационный режим · Данные сохраняются только в этом браузере и на этом устройстве.</div>{editing&&<section className="editor-workspace"><form onSubmit={save} className="editor-form"><div className="form-heading"><div><span className="editor-kicker">НОВАЯ КАРТОЧКА</span><h2>Данные изделия</h2></div><button type="button" className="plain" onClick={()=>setEditing(false)}>Закрыть ×</button></div><label>Название<input required name="title" value={form.title} onChange={update} placeholder="Например, Гранат многогранный"/></label><label>Slug <small>латинские буквы, цифры и дефисы</small><input required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" name="slug" value={form.slug} onChange={update} placeholder="garnat-mnogogrannyy"/></label><fieldset><legend>Шаблон карточки</legend><div className="template-options">{['arch','portrait','wide'].map(t=><label className={form.template===t?'active':''} key={t}><input type="radio" name="template" value={t} checked={form.template===t} onChange={update}/><span>{t}</span><small>{t==='arch'?'Арочная':t==='portrait'?'Вертикальная':'Широкая'}</small></label>)}</div></fieldset><label>Главное фото <small>предметное фото на сером фоне</small><input type="file" accept="image/*" onChange={upload}/></label><label>Материалы<input required name="materials" value={form.materials} onChange={update} placeholder="Золото 585 · гранаты"/></label><label>Короткое описание<textarea required name="shortDescription" value={form.shortDescription} onChange={update} rows="3"/></label><div className="form-row"><label>Порядок в каталоге<input type="number" min="1" max="999" required name="sortOrder" value={form.sortOrder} onChange={update}/></label><label className="check"><input type="checkbox" name="published" checked={form.published} onChange={update}/> Опубликовать</label></div>{error&&<p className="error" role="alert">{error}</p>}<button className="primary" type="submit">Сохранить карточку</button></form><div className="preview"><span className="editor-kicker">ПРЕДПРОСМОТР</span><p>Так карточка будет выглядеть в каталоге</p><Card item={{...form,image:form.image||defaults[0].image}} index={Math.max(0,Number(form.sortOrder)-1)} preview/></div></section>}<section className="editor-list"><div className="list-heading"><div><span className="editor-kicker">КАТАЛОГ</span><h2>Все карточки <span>{defaults.length+cards.length-hidden.length}</span></h2></div><button className="plain" onClick={reset}>Сбросить демо-данные</button></div><div className="list-rows">{[...defaults,...cards].filter(c=>!hidden.includes(c.slug)).sort((a,b)=>a.sortOrder-b.sortOrder).map(c=><div className="list-row" key={c.slug}><img src={c.image} alt=""/><div><strong>{c.title}</strong><small>{c.template} · порядок {c.sortOrder} · {c.published?'Опубликовано':'Черновик'}</small></div><button className="delete" onClick={()=>remove(c.slug)} aria-label={'Удалить карточку «'+c.title+'»'}>Удалить</button></div>)}</div></section></main></div>}
createRoot(document.getElementById('root')).render(location.pathname.replace(/\/$/,'')==='/editor'?<Editor/>:<Storefront/>);
