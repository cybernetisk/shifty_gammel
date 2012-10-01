require 'test_helper'

class TemplateShiftsControllerTest < ActionController::TestCase
  setup do
    @template_shift = template_shifts(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:template_shifts)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create template_shift" do
    assert_difference('TemplateShift.count') do
      post :create, template_shift: { comment: @template_shift.comment, shift_type_id: @template_shift.shift_type_id, start: @template_shift.start, stop: @template_shift.stop, training: @template_shift.training }
    end

    assert_redirected_to template_shift_path(assigns(:template_shift))
  end

  test "should show template_shift" do
    get :show, id: @template_shift
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @template_shift
    assert_response :success
  end

  test "should update template_shift" do
    put :update, id: @template_shift, template_shift: { comment: @template_shift.comment, shift_type_id: @template_shift.shift_type_id, start: @template_shift.start, stop: @template_shift.stop, training: @template_shift.training }
    assert_redirected_to template_shift_path(assigns(:template_shift))
  end

  test "should destroy template_shift" do
    assert_difference('TemplateShift.count', -1) do
      delete :destroy, id: @template_shift
    end

    assert_redirected_to template_shifts_path
  end
end
