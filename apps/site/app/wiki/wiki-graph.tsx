"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { GraphNode, GraphEdge } from "../../lib/graph";
import type { Simulation, SimulationNodeDatum, SimulationLinkDatum } from "d3-force";

interface SimNode extends SimulationNodeDatum {
  id: string;
  label: string;
  type: GraphNode["type"];
  tags: string[];
  url: string;
}

type SimEdge = SimulationLinkDatum<SimNode> & {
  reason: GraphEdge["reason"];
  sourceId: string;
  targetId: string;
};

interface Props {
  nodes: GraphNode[];
  edges: GraphEdge[];
  highlightedNodeIds: Set<string> | null;
}

// Editorial color palette for the warm research-journal surface.
const NODE_FILL: Record<GraphNode["type"], string> = {
  wiki: "oklch(61% 0.13 29)",
  paper: "oklch(62% 0.09 155)",
  blog: "oklch(58% 0.1 238)",
};

const EDGE_COLOR: Record<GraphEdge["reason"], string> = {
  related: "oklch(61% 0.13 29)",
  tag: "oklch(62% 0.09 155)",
};

const NODE_RADIUS: Record<GraphNode["type"], number> = {
  wiki: 14,
  paper: 10,
  blog: 12,
};

const TYPE_LABEL: Record<GraphNode["type"], string> = {
  wiki: "Wiki entry",
  paper: "Daily paper",
  blog: "Blog post",
};

const GRAPH_HEIGHT = 460;

export function WikiGraph({ nodes, edges, highlightedNodeIds }: Props) {
  const router = useRouter();
  const svgRef = useRef<SVGSVGElement>(null);
  const simRef = useRef<Simulation<SimNode, SimEdge> | null>(null);
  const posRef = useRef<SimNode[]>([]);
  const edgesRef = useRef<SimEdge[]>([]);
  const rafRef = useRef<number | null>(null);
  const [, forceUpdate] = useState(0);
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [settled, setSettled] = useState(false);
  const [width, setWidth] = useState(800);

  // Observe container width
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setWidth(w);
    });
    ro.observe(svg);
    setWidth(svg.getBoundingClientRect().width || 800);
    return () => ro.disconnect();
  }, []);

  // Init simulation
  useEffect(() => {
    let cancelled = false;
    setSettled(false);

    async function initSim() {
      const { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } =
        await import("d3-force");

      if (cancelled) return;

      const simNodes: SimNode[] = nodes.map((n) => ({
        ...n,
        x: width / 2 + (Math.random() - 0.5) * 240,
        y: GRAPH_HEIGHT / 2 + (Math.random() - 0.5) * 200,
      }));

      const nodeById = new Map(simNodes.map((n) => [n.id, n]));

      const simEdges: SimEdge[] = edges.flatMap((e) => {
        const s = nodeById.get(e.source);
        const t = nodeById.get(e.target);
        if (!s || !t) return [];
        return [{ source: s, target: t, reason: e.reason, sourceId: e.source, targetId: e.target }];
      });

      posRef.current = simNodes;
      edgesRef.current = simEdges;

      const sim = forceSimulation<SimNode>(simNodes)
        .force(
          "link",
          forceLink<SimNode, SimEdge>(simEdges)
            .id((d) => d.id)
            .distance(95)
            .strength(0.22),
        )
        .force("charge", forceManyBody<SimNode>().strength(-280))
        .force("center", forceCenter(width / 2, GRAPH_HEIGHT / 2))
        .force("collide", forceCollide<SimNode>().radius((d) => NODE_RADIUS[d.type] + 28))
        .alphaDecay(0.024);

      sim.on("tick", () => {
        if (rafRef.current !== null) return;
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = null;
          forceUpdate((n) => n + 1);
        });
      });

      sim.on("end", () => setSettled(true));

      simRef.current = sim;
      forceUpdate((n) => n + 1);
    }

    initSim();

    return () => {
      cancelled = true;
      simRef.current?.stop();
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges, width]);

  // Zoom/pan
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    let cancelled = false;

    async function attachZoom() {
      const { zoom, zoomIdentity } = await import("d3-zoom");
      const { select } = await import("d3-selection");
      if (cancelled || !svg) return;

      const z = zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.2, 5])
        .on("zoom", (event) => {
          const { x, y, k } = event.transform;
          setTransform({ x, y, k });
        });

      const sel = select(svg);
      sel.call(z);
      sel.call(z.transform, zoomIdentity);

      return () => sel.on(".zoom", null);
    }

    const cleanup = attachZoom();
    return () => {
      cancelled = true;
      cleanup.then((fn) => fn?.());
    };
  }, []);

  const handleNodeClick = useCallback(
    (node: SimNode, e: React.MouseEvent) => {
      e.stopPropagation();
      if (node.type === "blog") {
        window.open(node.url, "_blank", "noreferrer");
      } else {
        router.push(node.url);
      }
    },
    [router],
  );

  const simNodes = posRef.current;
  const simEdges = edgesRef.current;

  function nodeOpacity(id: string) {
    if (!highlightedNodeIds) return 1;
    return highlightedNodeIds.has(id) ? 1 : 0.08;
  }

  function edgeOpacity(e: SimEdge) {
    const baseOpacity = e.reason === "related" ? 0.5 : 0.18;
    if (!highlightedNodeIds) return baseOpacity;
    const srcId = typeof e.source === "object" ? (e.source as SimNode).id : e.sourceId;
    const tgtId = typeof e.target === "object" ? (e.target as SimNode).id : e.targetId;
    const active = highlightedNodeIds.has(srcId) && highlightedNodeIds.has(tgtId);
    return active ? (e.reason === "related" ? 0.7 : 0.38) : 0.04;
  }

  return (
    <div className="wiki-graph-wrap">
      {/* Compact legend */}
      <div className="wiki-graph-legend">
        {(["wiki", "paper", "blog"] as const).map((t) => (
          <span key={t} className="wiki-graph-legend-item">
            <span
              className="wiki-graph-legend-dot"
              style={{ background: NODE_FILL[t] }}
            />
            {TYPE_LABEL[t]}
          </span>
        ))}
        <span className="wiki-graph-legend-sep" aria-hidden="true" />
        <span className="wiki-graph-legend-item">
          <span className="wiki-graph-legend-line wiki-graph-legend-line--solid" />
          related
        </span>
        <span className="wiki-graph-legend-item">
          <span className="wiki-graph-legend-line wiki-graph-legend-line--dashed" />
          shared tag
        </span>
        <span className="wiki-graph-legend-hint">scroll · drag · click</span>
      </div>

      <svg
        ref={svgRef}
        className="wiki-graph-canvas"
        width="100%"
        height={GRAPH_HEIGHT}
        aria-label="Knowledge graph"
      >
        {/* Warm paper background fill */}
        <rect width="100%" height="100%" fill="oklch(97.8% 0.009 83)" />

        <g transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}>
          {/* Edges */}
          {simEdges.map((e, i) => {
            const src = e.source as SimNode;
            const tgt = e.target as SimNode;
            if (!src.x || !src.y || !tgt.x || !tgt.y) return null;
            return (
              <line
                key={i}
                x1={src.x}
                y1={src.y}
                x2={tgt.x}
                y2={tgt.y}
                stroke={EDGE_COLOR[e.reason]}
                strokeWidth={e.reason === "related" ? 1.6 : 1}
                strokeDasharray={e.reason === "tag" ? "4 4" : undefined}
                strokeLinecap="round"
                opacity={edgeOpacity(e)}
                style={{
                  transition: "opacity 320ms cubic-bezier(0.25,0,0,1)",
                  animationDelay: settled ? "0ms" : `${i * 18 + 300}ms`,
                }}
                className={settled ? undefined : "wiki-edge-enter"}
              />
            );
          })}

          {/* Nodes */}
          {simNodes.map((n, i) => {
            if (!n.x || !n.y) return null;
            const r = NODE_RADIUS[n.type];
            const isHovered = hoveredId === n.id;
            const opacity = nodeOpacity(n.id);
            const fill = NODE_FILL[n.type];

            return (
              <g
                key={n.id}
                transform={`translate(${n.x},${n.y})`}
                style={{
                  cursor: "pointer",
                  opacity,
                  transition: "opacity 320ms cubic-bezier(0.25,0,0,1)",
                  // staggered entrance
                  "--node-i": i,
                } as React.CSSProperties}
                className={settled ? "wiki-node" : "wiki-node wiki-node--entering"}
                onMouseEnter={() => setHoveredId(n.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={(e) => handleNodeClick(n, e)}
                aria-label={`${TYPE_LABEL[n.type]}: ${n.label}`}
              >
                <title>{n.label}</title>

                {/* Pulse ring on hover */}
                {isHovered && (
                  <circle
                    r={r + 14}
                    fill="none"
                    stroke={fill}
                    strokeWidth={1}
                    className="wiki-node-ring"
                    opacity={0}
                  />
                )}

                {/* Halo glow when highlighted */}
                {highlightedNodeIds?.has(n.id) && (
                  <circle
                    r={r + 5}
                    fill={fill}
                    opacity={0.18}
                  />
                )}

                {/* Main node circle */}
                <circle
                  r={isHovered ? r + 2.5 : r}
                  fill={fill}
                  stroke="oklch(97.8% 0.009 83)"
                  strokeWidth={isHovered ? 2.5 : 2}
                  style={{ transition: "r 160ms cubic-bezier(0.34,1.56,0.64,1)" }}
                />

                {/* Inner dot for wiki nodes (editorial mark) */}
                {n.type === "wiki" && (
                  <circle r={2.5} fill="oklch(97.8% 0.009 83)" opacity={0.7} />
                )}

                {/* Persistent label below the node */}
                <text
                  y={r + 13}
                  textAnchor="middle"
                  fontSize={isHovered ? 11 : 10}
                  fontWeight={isHovered ? 600 : 400}
                  fill={isHovered ? "oklch(18% 0.015 264)" : "oklch(32% 0.02 264)"}
                  fontFamily="var(--font-body)"
                  letterSpacing="0.01em"
                  style={{ pointerEvents: "none", transition: "font-size 120ms, fill 120ms" }}
                >
                  {n.label.length > 22 ? n.label.slice(0, 21) + "…" : n.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
