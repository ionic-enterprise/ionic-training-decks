# Training: Design Systems

This training focuses on using Stencil to create a component library as part of your overall Design System. In this training, we will explore the following topics.

- Define what is "Design System" is.
- Using Stencil to build a component library as part of a design system.

## Terminology

It is helpful to first agree on terminology. For the most part, there are no "official" definitions for any of these terms. In many cases, including this one, this is a very "buzzword" driven industry. As such, in order to avoid any confusion we will define up front what we mean by each of the following terms.

### Design Pattern

A _pattern_ is any repeating, reusable design. In the context of application design, a "design pattern" is any repeating, reusable element that is applied to solve a specific problem or evoke a specific emotion from the user of an application. Design patterns can be broken down into two main categories: functional patterns and perceptual patterns.

#### Functional Patterns

The tangible building blocks of a user interface, such as buttons, form inputs, headers, footers, tabs, and menus. Functional patterns relate to the ways in which the user interacts with the applications. Functional patterns are expressed in the front end as HTML.

#### Perceptual Patterns

Perceptual patterns are used to create a specific aesthetic and create an emotional connection with the user of the application. This can include such items as icons, typography, styles, and colors. Perceptual patterns relate to aesthetics and branding.

For example, The New York Times uses very specific fonts combined with font weights and sizes to identify itself as a brand. The consistent use of these fonts identify articles as coming from the New York Times and evoke a specific reaction from the reader because of that.

From a frontend coding perspective, perceptual patterns are typically expressed as CSS.

#### Other Types of Patterns

A design system often encapsulates other types of patterns as well, such as procedural patterns that define the various work flows within applications, or domain patterns that define aspects of applications within a specific domain such as e-commerce, banking, or transportation.

### Style Guide

A style guide defines stylistic items such as element styles, icons, typography, and colors. Styles guides tend to focus on the definition perceptual patterns.

### Pattern Library

A pattern library is a tool used to organize and share design patterns as well as provide guidance for their usage. A pattern library contains the definition of functional and perceptual design patterns as well as information on the proper way to apply those patterns.

### Design Language

A design language defines how the patterns used within a product (or set of products) is expressed across multiple teams and disciplines. A commonly understood language is the basis for clearly communicating of the design goals and ensuring they are implemented consistently.

### Design System

A "Design System" brings all of these items together. It is a set of connected patterns and practices organized to facilitate their use across a digital property or properties. A well constructed design system facilitates developers and designers working together in order to ensure a high quality consistent user experience.

It is important to keep in mind that a design system is not intended to be a large monolithic effort undertaken at the start of a project. Rather, it is meant to be a living system that evolves and grows over time. As such, the patterns, libraries, and design language used with the system should be specified such that they can evolve and grow over time rather than being static and thus brittle.
