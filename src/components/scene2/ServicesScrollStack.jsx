"use client";

import ScrollStack, { ScrollStackItem } from "@/components/services/ScrollStack";
import { ServiceBeforeAfter } from "./ServiceBeforeAfter";

export function ServiceStackCard({ service }) {
  return (
    <article className="services-stack-card__inner">
      <header className="services-stack-card__header">
        <span className="services-stack-card__index">{service.index}</span>
        <span className="services-stack-card__label">{service.label}</span>
      </header>

      <ServiceBeforeAfter
        serviceKey={service.id}
        visual={service.visual}
        before={service.before}
        after={service.after}
        title={service.title}
      />

      <div className="services-stack-card__meta">
        <h3 className="services-stack-card__title">{service.title}</h3>
        <p className="services-stack-card__desc">{service.description}</p>
      </div>
    </article>
  );
}

export function ServicesScrollStack({ services, progress }) {
  return (
    <ScrollStack
      className="services-scroll-stack"
      controlledProgress={progress}
      itemStackDistance={22}
      itemScale={0.035}
      baseScale={0.9}
      rotationAmount={0}
      blurAmount={0.8}
    >
      {services.map((service) => (
        <ScrollStackItem key={service.id} itemClassName="services-stack-card">
          <ServiceStackCard service={service} />
        </ScrollStackItem>
      ))}
    </ScrollStack>
  );
}
