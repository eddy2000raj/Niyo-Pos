import useCart from '../../hooks/useCart';

const Note = ({ remove }) => {
  const { cart, updateNote } = useCart();

  return (
    <>
      <hr className="hr light mt-md" />
      <div className="mt-md">
        <label className="label">Note</label>
        <div className="grid gutter-sm c-center">
          <div className="col-11">
            <input
              className="input input-xs"
              name="note"
              placeholder="Enter a note about this sale"
              value={cart.note}
              onChange={e => updateNote(e.target.value)}
            />
          </div>
          <div className="col-1 center pointer" onClick={() => remove()}>
            <i className="far fa-trash-alt"></i>
          </div>
        </div>
      </div>
    </>
  );
};

export default Note;
