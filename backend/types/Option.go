package types

// Option型の定義
type Option[T any] struct {
	value *T
}

// コンストラクタ
func Some[T any](value T) Option[T] {
	return Option[T]{value: &value}
}

func None[T any]() Option[T] {
	return Option[T]{value: nil}
}

// メソッド
func (o Option[T]) IsSome() bool {
	return o.value != nil
}

func (o Option[T]) IsNone() bool {
	return o.value == nil
}

func (o Option[T]) Unwrap() T {
	if o.value == nil {
		panic("called Unwrap on None value")
	}
	return *o.value
}

func (o Option[T]) UnwrapOr(defaultValue T) T {
	if o.value == nil {
		return defaultValue
	}
	return *o.value
}
