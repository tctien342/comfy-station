type TAny = ReturnType<JSON.values>

interface IComponent<T = {}> extends React.FC<React.PropsWithChildren<T>> {}
interface ISvgComponent<T = {}> extends IComponent<React.SVGProps<SVGSVGElement> & T> {}
interface IFilterControllerComponent<T = {}> extends IComponent<TFilterSectionValue & T> {}

// type TNextPage = import('next').NextPage<{ params: { lang: import('../i18n-config').Locale } }>;

type TNextPage<T = unknown> = import('next').NextPage<{
  params: { lang: import('../i18n-config').Locale } & T
}>

type ArrayElementType<ArrayType extends Array> = ArrayType[number]
