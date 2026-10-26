/** DOM navigation for a standard controller. No mouse or keyboard event synthesis needed. */
const FOCUSABLE='button:not([disabled]):not([hidden]),a[href],input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';
export function navigateController(root:HTMLElement,action:'next'|'previous'|'confirm'|'back'):boolean{
 const items=[...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(el=>
  !el.closest('.hidden,[hidden]')&&el.getClientRects().length>0);
 if(!items.length)return false;
 const focused=document.activeElement as HTMLElement|null;
 const index=focused?items.indexOf(focused):-1;
 if(action==='back')return false;
 if(action==='confirm'){
  const item=index>=0?items[index]:items[0];
  item.focus({preventScroll:true});
  item.click();
  return true;
 }
 const next=action==='next'?(index+1)%items.length:(index<0?items.length-1:(index+items.length-1)%items.length);
 items[next].focus({preventScroll:true});
 return true;
}
