"use client";

import { motion, Variants } from "framer-motion";
import Link from "next/link";
import {
  DocumentTextIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  CloudArrowUpIcon,
  BoltIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import { Logo } from "./logo";
import { useTranslations } from "../lib/i18n/context";
import { LanguageSelector } from "./language-selector";

export function Hero() {
  const { t } = useTranslations();
  
  const features = [
    {
      icon: SparklesIcon,
      title: t("hero.features.aiGeneration.title"),
      description: t("hero.features.aiGeneration.description"),
      gradient: "from-xinfinity-primary to-xinfinity-secondary",
    },
    {
      icon: CloudArrowUpIcon,
      title: t("hero.features.fileUpload.title"),
      description: t("hero.features.fileUpload.description"),
      gradient: "from-xinfinity-secondary to-xinfinity-accent",
    },
    {
      icon: BoltIcon,
      title: t("hero.features.instantProcessing.title"),
      description: t("hero.features.instantProcessing.description"),
      gradient: "from-xinfinity-accent to-xinfinity-primary-light",
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: t("hero.features.naturalLanguage.title"),
      description: t("hero.features.naturalLanguage.description"),
      gradient: "from-xinfinity-primary-light to-xinfinity-secondary-light",
    },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const floatingVariants: Variants = {
    float: {
      y: [-20, 20, -20],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Dynamic Background with Fibonacci-inspired gradients */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50" />

        {/* Fibonacci-positioned floating orbs */}
        <motion.div
          variants={floatingVariants}
          animate="float"
          className="absolute top-1/5 left-1/5 w-89 h-89 bg-gradient-to-r from-xinfinity-primary/20 to-xinfinity-secondary/20 rounded-full blur-3xl"
        />
        <motion.div
          variants={floatingVariants}
          animate="float"
          style={{ animationDelay: "2s" }}
          className="absolute top-3/5 right-1/5 w-55 h-55 bg-gradient-to-r from-xinfinity-secondary/20 to-xinfinity-accent/20 rounded-full blur-3xl"
        />
        <motion.div
          variants={floatingVariants}
          animate="float"
          style={{ animationDelay: "4s" }}
          className="absolute bottom-1/4 left-1/2 w-34 h-34 bg-gradient-to-r from-xinfinity-accent/20 to-xinfinity-primary-light/20 rounded-full blur-3xl"
        />

        {/* Grid Pattern with Fibonacci spacing */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(30,64,175,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(30,64,175,0.03)_1px,transparent_1px)] bg-[size:21px_21px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-fibonacci mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          {/* Language Selector - Mobile/Top */}
          <motion.div
            variants={itemVariants}
            className="flex justify-center mb-8 lg:hidden"
          >
            <LanguageSelector variant="compact" className="max-w-xs" />
          </motion.div>

          {/* Animated Logo Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center px-6 py-3 rounded-full xinfinity-card mb-8"
          >
            <Logo size="md" animated={true} className="mr-3" />
            <span className="text-sm font-medium xinfinity-text-gradient">
              {t("hero.poweredBy")}
            </span>
          </motion.div>

          {/* Main Heading with Fibonacci-based typography */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight"
          >
            <span className="block bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
              {t("hero.title")}
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed"
          >
            {t("hero.subtitle")}
          </motion.p>

          {/* CTA Button - Single button */}
          <motion.div
            variants={itemVariants}
            className="flex justify-center items-center mb-16"
          >
            <Link href="/demo/multilang-pdf" className="xinfinity-button group text-lg px-10 py-4">
              <SparklesIcon className="w-6 h-6 mr-3" />
              {t("hero.tryButton")}
              <ArrowRightIcon className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </motion.div>

          {/* Features Grid with Fibonacci proportions */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{
                  y: -8,
                  transition: { duration: 0.3 },
                }}
                className="xinfinity-card group cursor-pointer"
              >
                <div
                  className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.gradient} mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Stats Section with Fibonacci-based layout */}
          <motion.div
            variants={itemVariants}
            className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                label: t("hero.stats.documents"),
                value: "10,000+",
                gradient: "from-xinfinity-primary to-xinfinity-secondary",
              },
              {
                label: t("hero.stats.timeSaved"),
                value: "500+",
                gradient: "from-xinfinity-secondary to-xinfinity-accent",
              },
              {
                label: t("hero.stats.satisfaction"),
                value: "99.5%",
                gradient: "from-xinfinity-accent to-xinfinity-primary-light",
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.6,
                  delay: 0.8 + index * 0.2,
                  ease: [0.4, 0, 0.2, 1],
                }}
                className="text-center"
              >
                <div
                  className={`text-4xl md:text-5xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-2`}
                >
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}
