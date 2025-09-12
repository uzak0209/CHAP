package types

// Result型の定義
type Result[T any] struct {
	value *T
	err   error
}

// コンストラクタ
func Ok[T any](value T) Result[T] {
	return Result[T]{value: &value, err: nil}
}

func Err[T any](err error) Result[T] {
	return Result[T]{value: nil, err: err}
}

// メソッド
func (r Result[T]) IsOk() bool {
	return r.err == nil
}

func (r Result[T]) IsErr() bool {
	return r.err != nil
}

func (r Result[T]) Unwrap() T {
	if r.err != nil {
		panic("called Unwrap on Err value: " + r.err.Error())
	}
	return *r.value
}

func (r Result[T]) UnwrapOr(defaultValue T) T {
	if r.err != nil {
		return defaultValue
	}
	return *r.value
}

func (r Result[T]) Error() error {
	return r.err
}
