import { Html } from '@react-three/drei'

export default function Annotation({ onClickFunction, children, ...props }) {
  return (
    <Html
      {...props}
      transform
      occlude
    >
      <div className="annotation" onClick={() => onClickFunction()}>
        {children}
      </div>
    </Html>
  )
}