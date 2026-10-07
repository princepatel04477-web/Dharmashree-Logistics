"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

/* Single registration point. All GSAP plugins ship in the free `gsap`
   package. Every consumer imports from here — never from "gsap" directly. */
gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, MotionPathPlugin, SplitText);

export { gsap, ScrollTrigger, DrawSVGPlugin, MotionPathPlugin, SplitText, useGSAP };
