/********************************************************************************
 * Copyright (c) 2017-2018 TypeFox and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

/** @jsx svg */
import { svg } from './jsx';

import { VNode } from "snabbdom";
import { Point } from 'sprotty-protocol/lib/utils/geometry';
import { IView, IViewArgs, RenderingContext } from "../base/views/view";
import { SNodeImpl, SPortImpl } from "../graph/sgraph";
import { ViewportRootElementImpl } from "../features/viewport/viewport-root";
import { SShapeElementImpl } from '../features/bounds/model';
import { ShapeView } from '../features/bounds/views';
import { Hoverable } from '../features/hover/model';
import { Selectable } from '../features/select/model';
import { Diamond } from '../utils/geometry';
import { SModelElementImpl } from '../base/model/smodel';
import { injectable } from 'inversify';

@injectable()
export class SvgViewportView implements IView {
    render(model: Readonly<ViewportRootElementImpl>, context: RenderingContext, args?: IViewArgs): VNode {
        const transform = `scale(${model.zoom}) translate(${-model.scroll.x},${-model.scroll.y})`;
        return <svg>
            <g transform={transform}>
                {context.renderChildren(model)}
            </g>
        </svg>;
    }
}

@injectable()
export class CircularNodeView extends ShapeView {
    render(node: Readonly<SShapeElementImpl & Hoverable & Selectable>, context: RenderingContext, args?: IViewArgs): VNode | undefined {
        if (!this.isVisible(node, context)) {
            return undefined;
        }
        const radius = this.getRadius(node);
        return <g>
            <circle class-sprotty-node={node instanceof SNodeImpl} class-sprotty-port={node instanceof SPortImpl}
                    class-mouseover={node.hoverFeedback} class-selected={node.selected}
                    r={radius} cx={radius} cy={radius}></circle>
            {context.renderChildren(node)}
        </g>;
    }

    protected getRadius(node: SShapeElementImpl): number {
        const d = Math.min(node.size.width, node.size.height);
        return d > 0 ? d / 2 : 0;
    }
}

@injectable()
export class RectangularNodeView extends ShapeView {
    render(node: Readonly<SShapeElementImpl & Hoverable & Selectable>, context: RenderingContext, args?: IViewArgs): VNode | undefined {
        if (!this.isVisible(node, context)) {
            return undefined;
        }
        return <g>
            <rect class-sprotty-node={node instanceof SNodeImpl} class-sprotty-port={node instanceof SPortImpl}
                  class-mouseover={node.hoverFeedback} class-selected={node.selected}
                  x="0" y="0" width={Math.max(node.size.width, 0)} height={Math.max(node.size.height, 0)}></rect>
            {context.renderChildren(node)}
        </g>;
    }
}

@injectable()
export class DiamondNodeView extends ShapeView {
    render(node: Readonly<SShapeElementImpl & Hoverable & Selectable>, context: RenderingContext, args?: IViewArgs): VNode | undefined {
        if (!this.isVisible(node, context)) {
            return undefined;
        }
        const diamond = new Diamond({ height: Math.max(node.size.height, 0), width: Math.max(node.size.width, 0), x: 0, y: 0 });
        const points = `${svgStr(diamond.topPoint)} ${svgStr(diamond.rightPoint)} ${svgStr(diamond.bottomPoint)} ${svgStr(diamond.leftPoint)}`;
        return <g>
            <polygon class-sprotty-node={node instanceof SNodeImpl} class-sprotty-port={node instanceof SPortImpl}
                  class-mouseover={node.hoverFeedback} class-selected={node.selected}
                  points={points} />
            {context.renderChildren(node)}
        </g>;
    }
}

function svgStr(point: Point) {
    return `${point.x},${point.y}`;
}

@injectable()
export class EmptyGroupView implements IView {
    render(model: Readonly<SModelElementImpl>, context: RenderingContext): VNode {
        return <g></g>;
    }
}
