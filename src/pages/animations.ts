import {style, animate, transition, state, trigger} from '@angular/core';


export class Animations {
  static transitions = [
  trigger('flyInAbove', [
      state('inactive', style({
        opacity:0,
        transform: 'translateY(-100%)',
       webkitTransform: 'translateY(-100%)'
        
      })),
      state('active',   style({
        opacity:1,
        transform: 'translateY(0%)',
       webkitTransform: 'translateY(0%)'
      })),
      transition('inactive => active', animate('500ms ease-in')),
      transition('active => inactive', animate('500ms ease-out'))
  ]),
    trigger('flyInBelow', [
      state('inactive', style({
        opacity:0,
        transform: 'translateY(100%)',
       webkitTransform: 'translateY(100%)'
      })),
      state('active',   style({
        opacity:1,
        transform: 'translateY(0%)',
       webkitTransform: 'translateY(0%)'
      })),
      transition('inactive => active', animate('500ms ease-in')),
      transition('active => inactive', animate('500ms ease-out'))
  ])];

}


