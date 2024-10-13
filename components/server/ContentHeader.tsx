export default function ContentHeader({ title: title }: { title?: string }) {
  return (
    <section
      className="font-semibold text-2xl min-md:text-3xl pl-10 pr-10 text-gray-500 dark:text-gray-400 absolute top-3"
      suppressHydrationWarning
    >
      {title}
    </section>
  );
}
