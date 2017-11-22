import * as React from 'react';

declare module '*.scss';

declare module 'react' {
    export interface Attributes {
        styleName?: string;
    }
}
